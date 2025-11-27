import { Injectable } from '@nestjs/common';

@Injectable()
export class SlackService {
    install(): string {
      const botScopes = [
      'channels:history',  // Read channel messages
      'channels:read',     // See channel info
      'groups:history',    // Read private channel messages
      'groups:read',       // See private channel info
      'im:history',        // Read DMs
      'im:read',           // See DM info
      'users:read',        // Get user info
      'app_mentions:read', // See @mentions
      // 'chat:write',        // Check it if necessary 
      ].join(',');

      return `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${botScopes}&redirect_uri=${process.env.SLACK_REDIRECT_URI}`;
    }
   async saveMessage(event: any) {
        try {
            console.log('New message received:', {
                user: event.user,
                channel: event.channel,
                text: event.text,
                ts: event.ts,
                team: event.team
            });

            // TODO: Save to your database
            // Example structure:
            const messageData = {
                messageId: event.client_msg_id || event.ts,
                userId: event.user,
                channelId: event.channel,
                teamId: event.team,
                text: event.text,
                timestamp: new Date(parseFloat(event.ts) * 1000),
                threadTs: event.thread_ts || null,
                // Add any other fields you need
            };

            console.log('Prepared message data for saving:', messageData);

            // Save to database here
            // await this.messageRepository.save(messageData);

            console.log('Message saved successfully');
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    }
}
