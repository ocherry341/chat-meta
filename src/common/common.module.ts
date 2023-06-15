/*
https://docs.nestjs.com/modules
*/

import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PineconeClientModule } from '../config/pinecone-client-module/pinecone-client.module';
import { OpenaiApiService } from './services/openai-api.service';
import { PineconeApiService } from './services/pinecone-api.service';

@Global()
@Module({})
export class CommonModule {
  static forRoot(): DynamicModule {
    return {
      module: CommonModule,
      imports: [
        PineconeClientModule.register(),
        JwtModule.register({
          global: true,
        }),
      ],
      providers: [
        OpenaiApiService,
        PineconeApiService,
      ],
      exports: [
        OpenaiApiService,
        PineconeApiService,
      ],
    };
  }

}
