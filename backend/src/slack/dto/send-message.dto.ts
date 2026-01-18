import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
    @ApiProperty({ description: 'The Slack channel ID to post the message to' })
    @IsNotEmpty()
    @IsString()
    channelId: string;

    @ApiProperty({ description: 'The message text to post' })
    @IsNotEmpty()
    @IsString()
    message: string;
}