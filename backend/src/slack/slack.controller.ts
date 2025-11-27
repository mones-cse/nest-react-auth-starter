import { Body, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Param, Post, Query, Req, Res, Response, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response as ExpressResponse } from "express";
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SlackService } from './slack.service';

@Controller('slack')
export class SlackController {
    constructor(private readonly slackService: SlackService) { }

    @Get('/install')
    @ApiOperation({ summary: 'Install Slack app' })
    @HttpCode(HttpStatus.OK)
    async slackInstall(
        @Response() response: ExpressResponse
    ): Promise<void> {
        const url = this.slackService.install();
        console.log({ url })
        return response.redirect(url)
    }

    @Get("/oauth_redirect")
    @ApiOperation({ summary: 'Handle Slack OAuth redirect' })
    @HttpCode(HttpStatus.OK)
    async handleOAuthRedirect(
        @Query("code") code: string,
        @Response() response: ExpressResponse
    ): Promise<void> {
        const result = await this.slackService.handleOAuthRedirect(code)
        if (result) {
            return response.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/')
        }
        else {
            throw new InternalServerErrorException()
        }
    }

    @Post('messages')
    @ApiOperation({ summary: 'Handle Slack message events' })
    @HttpCode(200)
    async handleMessages(
        @Req() request: any,
        @Res() response: ExpressResponse,
    ) {
        try {
            const body = request.body;
            console.log('Received Slack message event:', body);
            // Handle URL verification challenge
            if (body.type === 'url_verification') {
                return response.status(200).json({ challenge: body.challenge });
            }

            // Handle message events
            if (body.event && body.event.type === 'message') {
                // Avoid duplicate processing of bot messages
                if (body.event.subtype === 'bot_message') {
                    return response.status(200).send();
                }

                // Process the message asynchronously
                this.slackService.saveMessage(body.event).catch(err => {
                    console.error('Error saving message:', err);
                });

                // Respond immediately to Slack (within 3 seconds)
                return response.status(200).send();
            }

            return response.status(200).send();
        } catch (error) {
            console.error('Error handling Slack message event:', error);
            return response.status(500).send({ error: 'Internal server error' });
        }
    }

    @Get('workspaces')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all Slack workspaces for the authenticated user' })
    async getWorkspaces(@Req() request: any) {
        try {
            console.log('Fetching workspaces for user:', request?.user);
            const userId = request?.user?.id || null;
            const workspaces = await this.slackService.getSlackWorkspaces(userId);
            return workspaces;
        } catch (error) {
            console.error("Error fetching workspaces", error);
            throw new InternalServerErrorException("Failed to fetch workspaces");
        }
    }


}
