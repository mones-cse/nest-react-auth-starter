import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendThreadMessageDto {
    @ApiProperty({ description: 'The Slack channel ID where the thread exists' })
    @IsNotEmpty()
    @IsString()
    channelId: string;

    @ApiProperty({ description: 'The message text to post in the thread' })
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiProperty({ description: 'Thread timestamp (ts) of the parent message' })
    @IsNotEmpty()
    @IsString()
    threadTs: string;
}