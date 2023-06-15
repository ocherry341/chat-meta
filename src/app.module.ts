import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';
import { CommonModule } from './common/common.module';
import { validate } from './config/env.validation';
import { ChatModule } from './modules/chat/chat.module';
import { DocumentModule } from './modules/document/document.module';
import { MetadataModule } from './modules/metadata/metadata.module';

@Module({
  imports: [
    CommonModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      ignoreEnvFile: !existsSync(join(process.cwd(), '.env')),
    }),
    MetadataModule,
    ChatModule,
    DocumentModule,
  ],
})
export class AppModule { }
