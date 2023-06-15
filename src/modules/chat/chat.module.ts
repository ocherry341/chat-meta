import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';


@Module({
  imports: [
    MetadataModule,
  ],
  controllers: [
    ChatController,
  ],
  providers: [
    ChatService,
  ],
})
export class ChatModule { }
