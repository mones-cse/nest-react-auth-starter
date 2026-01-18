import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, Patch, Post, Query, Req, Res, Response, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response as ExpressResponse } from "express";
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { SendThreadMessageDto } from './dto/send-thread-message.dto';
import { UpdateSlackWorkspaceDto } from './dto/update-slack-workspace.dto';
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
            // console.log('Received Slack message event:', body);
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

    @Patch('workspaces/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Activate or Deactivate a Slack workspace' })
    async updateWorkspace(
        @Req() request: any,
        @Param('id') id: string,
        @Body() updateData: UpdateSlackWorkspaceDto
    ) {
        try {
            const userId = request?.user?.id || null;
            const result = await this.slackService.updateSlackWorkspace(id, userId, updateData);
            return result
        } catch (error) {
            console.error("Error updating workspace", error);
            if (error instanceof NotFoundException || error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(
                "Failed to update workspace ", error?.message || "Unknown error"
            );
        }
    }

    @Delete('workspaces/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a Slack workspace' })
    async deleteWorkspace(
        @Req() request: any,
        @Param('id') id: string,
    ) {
        try {
            const userId = request?.user?.id || null;
            const result = await this.slackService.deleteSlackWorkspace(id, userId);
            return result
        } catch (error) {
            console.error("Error deleting workspace", error);
            if (error instanceof NotFoundException || error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(
                "Failed to delete workspace ", error?.message || "Unknown error"
            );
        }
    }

    @Post('notify')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send a message to a Slack channel' })
    async sendMessage(
        @Req() request: any,
        @Body() sendMessageDto: SendMessageDto
    ) {
        try {
            const userId = request?.user?.id || null;
            const result = await this.slackService.sendMessageToChannel(
                userId,
                sendMessageDto.channelId,
                sendMessageDto.message
            );
            return {
                success: true,
                message: 'Message sent successfully',
                data: result
            };
        } catch (error) {
            console.error("Error sending Slack message", error);
            if (error instanceof NotFoundException || error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(
                "Failed to send message: " + (error?.message || "Unknown error")
            );
        }
    }

    @Post('notify-thread')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send a reply message to a Slack thread' })
    async sendThreadMessage(
        @Req() request: any,
        @Body() sendThreadMessageDto: SendThreadMessageDto
    ) {
        try {
            const userId = request?.user?.id || null;
            const result = await this.slackService.sendMessageToThread(
                userId,
                sendThreadMessageDto.channelId,
                sendThreadMessageDto.threadTs,
                sendThreadMessageDto.message
            );
            return {
                success: true,
                message: 'Thread reply sent successfully',
                data: result
            };
        } catch (error) {
            console.error("Error sending Slack thread message", error);
            if (error instanceof NotFoundException || error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(
                "Failed to send thread message: " + (error?.message || "Unknown error")
            );
        }
    }

    @Post('register-notification')
    @ApiOperation({ summary: 'Handle Slack slash command /register-notification' })
    @HttpCode(200)
    async handleRegisterNotification(
        @Req() request: any,
        @Res() response: ExpressResponse,
    ) {
        try {
            const body = request.body;
            console.log('📝 Received /register-notification command:', body);

            // Extract data from slash command
            const channelId = body.channel_id;
            const userId = body.user_id;
            const userName = body.user_name;
            const teamId = body.team_id;
            const text = body.text;

            // Process the registration and create thread
            const result = await this.slackService.handleRegisterNotification({
                channelId,
                threadTs: null,
                userId,
                userName,
                teamId,
                text
            });

            // Respond to Slack
            return response.status(200).json({
                response_type: 'ephemeral',
                text: `✅ Notification thread created!\n📍 Channel: ${result.channelId}\n🧵 Thread: ${result.threadTs}`
            });

        } catch (error) {
            console.error('Error handling /register-notification command:', error);
            return response.status(200).json({
                response_type: 'ephemeral',
                text: `❌ Failed to create notification thread ${error?.message}`
            });
        }
    }


}
