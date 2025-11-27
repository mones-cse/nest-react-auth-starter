import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, Res, Response } from '@nestjs/common';

import type { Response as ExpressResponse } from "express";
import { SlackService } from './slack.service';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get('/install')
  @HttpCode(HttpStatus.OK)
  async slackInstall(
      @Response() response: ExpressResponse
  ): Promise<void> {
      const url = this.slackService.install();
      console.log({url})
      return response.redirect(url)
  }

  @Post('messages')
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
}
