import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WebClient } from '@slack/web-api';
import axios from 'axios';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { UpdateSlackWorkspaceDto } from './dto/update-slack-workspace.dto';
import { SlackInstallation } from './entities/slack.entity';

@Injectable()
export class SlackService {

    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService,

        @InjectRepository(SlackInstallation)
        private readonly slackInstallationRepo: Repository<SlackInstallation>
    ) { }

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
            'chat:write',        // Check it if necessary
            'commands',          // Slash commands
        ].join(',');
        const userScopes = [
            'users:read',
            'users:read.email'
        ].join(',');

        return `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${botScopes}&user_scope=${userScopes}&redirect_uri=${process.env.SLACK_REDIRECT_URI}`;
    }

    private async exchangeCodeForTokens(code: string): Promise<any> {
        const response = await axios.post("https://slack.com/api/oauth.v2.access", null, {
            params: {
                code,
                client_id: process.env.SLACK_CLIENT_ID,
                client_secret: process.env.SLACK_CLIENT_SECRET,
                redirect_uri: process.env.SLACK_REDIRECT_URI
            }
        });
        console.log('OAuth Response:', response.data);
        return response.data;
    }

    private extractOAuthData(data: any) {
        return {
            slackTeamId: data.team.id,
            slackTeamName: data.team.name,
            slackUserId: data.authed_user?.id || null,
            botToken: data.access_token,
            userToken: data.authed_user?.access_token || null,
        }
    }

    private validateOAuthData(data: any) {
        if (!data.slackUserId || !data.userToken) {
            throw new BadRequestException("Slack User ID and User Token are required");
        }
    }

    async getUserIDBySlackUserIDAndToken(slack_user_id: string, user_token: string): Promise<string | null> {

        try {
            const response = await axios.get('https://slack.com/api/users.info', {
                params: { user: slack_user_id },
                headers: { Authorization: `Bearer ${user_token}` }
            })

            if (response.data.ok) {
                const userProfile = {
                    name: response?.data?.user?.name,
                    real_name: response?.data?.user?.real_name,
                    email: response?.data?.user?.profile.email
                }
                let user = await this.userService.findByEmail(userProfile.email);
                if (user) {
                    return user?.id;
                } else {
                    throw new InternalServerErrorException("User not found");
                }
            }
            throw new InternalServerErrorException("Failed to fetch user info from Slack");
        } catch (err) {
            console.error("Error fetching user ID by Slack User ID and Token: ", err);
            throw new InternalServerErrorException("Failed to fetch user info from Slack");
        }

    }

    private async createSlackInstallation(installationData: any) {
        // Check if an installation already exists for this team and user
        console.log("⭐️⭐️⭐️⭐️⭐️")
        console.log(installationData)
        try {
            const existingInstallation = await this.slackInstallationRepo.findOne({
                where: {
                    slackTeamId: installationData.slackTeamId,
                    slackUserId: installationData.slackUserId
                }
            });
            console.log({ existingInstallation })

            if (existingInstallation) {
                // Update the existing installation with new tokens and data
                Object.assign(existingInstallation, installationData);
                await this.slackInstallationRepo.save(existingInstallation);
                console.log('Updated existing Slack installation for team:', installationData.slackTeamId);
            } else {
                // Create a new installation
                const installation = this.slackInstallationRepo.create(installationData);
                await this.slackInstallationRepo.save(installation);
                console.log('Created new Slack installation for team:', installationData.slackTeamId);
            }
        } catch (err) {
            console.log({ err })
            throw new InternalServerErrorException(err);
        }
    }


    async handleOAuthRedirect(code: string): Promise<boolean> {
        if (!code) throw new BadRequestException("Code is required for OAuth");

        try {
            const oauthResponse = await this.exchangeCodeForTokens(code);
            if (!oauthResponse.ok) {
                throw new InternalServerErrorException(oauthResponse.error);
            }

            const oauthData = this.extractOAuthData(oauthResponse);
            console.log("🚀 ~ SlackAppService ~ handleOAuthRedirect ~ oauthData:", oauthData)
            this.validateOAuthData(oauthData);
            console.log("🚀 ~ SlackAppService ~ handleOAuthRedirect ~ validateOAuthData:", oauthData)

            const userId = await this.getUserIDBySlackUserIDAndToken(oauthData.slackUserId, oauthData.userToken);
            console.log("🚀 ~ SlackAppService ~ handleOAuthRedirect ~ userId:", userId)

            if (!userId) {
                throw new BadRequestException("User ID not found");
            }

            await this.createSlackInstallation({
                ...oauthData,
                userId,
                isActive: true
            })
            return true;
        } catch (err) {
            console.error("Error in handleOAuthRedirect: ", err);
            throw err;
        }
    }


    // workspace 
    getSlackWorkspaces = async (userId: string) => {
        const workspaces = await this.slackInstallationRepo.find({
            where: { userId: userId },
            select: ['slackTeamId', 'slackTeamName', 'isActive', 'createdAt', 'updatedAt', 'id']
        })
        return workspaces
    }

    updateSlackWorkspace = async (id: string, userId: string, updateData: UpdateSlackWorkspaceDto) => {
        const result = await this.slackInstallationRepo.update({ id, userId }, updateData);
        if (result.affected === 0) {
            throw new NotFoundException('Workspace not found or unauthorized');
        }
        return {
            id,
            ...updateData,
            updatedAt: new Date()
        };
    }

    deleteSlackWorkspace = async (id: string, userId: string) => {
        const result = await this.slackInstallationRepo.delete({ id, userId });
        if (result.affected === 0) {
            throw new NotFoundException('Workspace not found or unauthorized');
        }
        return true;
    }

    // interaction
    async saveMessage(event: any) {
        try {
            // console.log('New message received:', {
            //     user: event.user,
            //     channel: event.channel,
            //     text: event.text,
            //     ts: event.ts,
            //     team: event.team
            // });

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

            // console.log('Prepared message data for saving:', messageData);

            // Save to database here
            // await this.messageRepository.save(messageData);

            // console.log('Message saved successfully');
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    }

    async sendMessageToChannel(userId: string, channelId: string, message: string) {
        console.log('Do nothing', userId, channelId, message);
        try {
            // Get an active Slack installation for this user
            const installation = await this.slackInstallationRepo.findOne({
                where: {
                    userId: userId,
                    isActive: true
                }
            });

            if (!installation) {
                throw new NotFoundException('No active Slack workspace found for this user');
            }

            // Initialize Slack Web Client with bot token
            const slackClient = new WebClient(installation.botToken);

            // Send the message
            const result = await slackClient.chat.postMessage({
                channel: channelId,
                text: message
            });

            console.log('Message sent successfully:', result);

            return {
                ok: result.ok,
                channel: result.channel,
                ts: result.ts,
                messageId: result.ts
            };
        } catch (error) {
            console.error('Error sending message to Slack:', error);

            if (error.data?.error === 'channel_not_found') {
                throw new NotFoundException('Slack channel not found');
            }
            if (error.data?.error === 'not_in_channel') {
                throw new BadRequestException('Bot is not a member of this channel');
            }
            if (error.data?.error === 'invalid_auth') {
                throw new BadRequestException('Invalid Slack authentication token');
            }

            throw new InternalServerErrorException('Failed to send Slack message');
        }
    }

    async sendMessageToThread(userId: string, channelId: string, threadTs: string, message: string) {
        try {
            // Get an active Slack installation for this user
            const installation = await this.slackInstallationRepo.findOne({
                where: {
                    userId: userId,
                    isActive: true
                }
            });

            if (!installation) {
                throw new NotFoundException('No active Slack workspace found for this user');
            }

            // Initialize Slack Web Client with bot token
            const slackClient = new WebClient(installation.botToken);

            // Send the message as a thread reply
            const result = await slackClient.chat.postMessage({
                channel: channelId,
                text: message,
                thread_ts: threadTs // This makes it a thread reply
            });

            console.log('Thread reply sent successfully:', result);

            return {
                ok: result.ok,
                channel: result.channel,
                ts: result.ts,
                messageId: result.ts,
                threadTs: threadTs,
                isThreadReply: true
            };
        } catch (error) {
            console.error('Error sending thread message to Slack:', error);

            if (error.data?.error === 'channel_not_found') {
                throw new NotFoundException('Slack channel not found');
            }
            if (error.data?.error === 'not_in_channel') {
                throw new BadRequestException('Bot is not a member of this channel');
            }
            if (error.data?.error === 'invalid_auth') {
                throw new BadRequestException('Invalid Slack authentication token');
            }
            if (error.data?.error === 'thread_not_found') {
                throw new NotFoundException('Thread not found - invalid thread_ts');
            }
            if (error.data?.error === 'message_not_found') {
                throw new NotFoundException('Parent message not found');
            }

            throw new InternalServerErrorException('Failed to send thread reply');
        }
    }

    async handleRegisterNotification(data: {
        channelId: string;
        threadTs: string | null;
        userId: string;
        userName: string;
        teamId: string;
        text: string;
    }) {
        try {
            console.log('🔔 Processing notification registration:', data);

            // Find the slack installation for this team
            const installation = await this.slackInstallationRepo.findOne({
                where: {
                    slackTeamId: data.teamId,
                    isActive: true
                }
            });

            if (!installation) {
                throw new NotFoundException('No active Slack installation found for this team');
            }

            // Initialize Slack Web Client with bot token
            const slackClient = new WebClient(installation.botToken);

            // Post "Notification Thread" message to create a thread
            const result = await slackClient.chat.postMessage({
                channel: data.channelId,
                text: 'Notification Thread'
            });

            // The ts from the posted message becomes the thread_ts
            const threadTs = result.ts;

            console.log('✅ Notification thread created successfully');
            console.log('📊 Registration Details:');
            console.log({
                channelId: data.channelId,
                threadTs: threadTs,
                userId: data.userId,
                userName: data.userName,
                teamId: data.teamId,
            });

            // TODO: Save to your database
            // const subscription = await this.notificationRepo.save({
            //     channelId: data.channelId,
            //     threadTs: threadTs,
            //     slackUserId: data.userId,
            //     slackTeamId: data.teamId,
            //     isActive: true,
            //     createdAt: new Date()
            // });

            return {
                success: true,
                channelId: data.channelId,
                threadTs: threadTs,
                userId: data.userId,
                userName: data.userName,
                teamId: data.teamId,
            };
        } catch (error) {
            console.error('Error in handleRegisterNotification:', error);
            throw error;
        }
    }
}
