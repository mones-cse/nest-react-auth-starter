import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { SlackInstallation } from './entities/slack.entity';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';

@Module({
  controllers: [SlackController],
  providers: [SlackService],
  exports: [SlackService],
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([SlackInstallation])]
})
export class SlackModule { }
