import { DynamicModule, Module } from "@nestjs/common";
import { PineconeClientService } from "./pinecone-client.service";

@Module({})
export class PineconeClientModule {

  static register(): DynamicModule {
    return {
      module: PineconeClientModule,
      providers: [
        PineconeClientService,
      ],
      exports: [
        PineconeClientService,
      ],
    };
  }

}

