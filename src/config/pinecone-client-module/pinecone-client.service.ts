import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PineconeClient } from '@pinecone-database/pinecone';
import { VectorOperationsApi } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

@Injectable()
export class PineconeClientService implements OnModuleInit {

  constructor(
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    await this.initClient();
    await this.initIndex();
  }

  private readonly pineconeIndex = this.configService.get<string>('PINECONE_INDEX');
  private readonly namespace = this.configService.get<string>('PIENCONE_NAMESPACE') || "";

  public index: VectorOperationsApi;
  public client: PineconeClient = new PineconeClient();

  private async initClient() {
    try {
      await this.client.init({
        apiKey: this.configService.get<string>('PINECONE_API_KEY'),
        environment: this.configService.get<string>('PINECONE_ENVIRONMENT'),
      });
      Logger.log(`Connected to pinecone`, 'PineconeClient');
    } catch (error) {
      Logger.error(`Error connecting to pinecone`, 'PineconeClient');
      throw error;
    }
  }

  private async initIndex() {
    const indexList = await this.client.listIndexes();
    if (!indexList.includes(this.pineconeIndex)) {
      try {
        await this.client.createIndex({
          createRequest: {
            name: this.pineconeIndex,
            dimension: 1536,
            metric: 'cosine',
            podType: 's1',
          }
        });
        Logger.log(`Created pinecone index: "${this.pineconeIndex}"`, 'PineconeClient');
      } catch (error) {
        Logger.error(`Error creating index: "${this.pineconeIndex}", check your pinecone account.`, 'PineconeClient');
        throw error;
      }
    };
    this.index = this.client.Index(this.pineconeIndex);
    Logger.log(`Pinecone index: "${this.pineconeIndex}" is ready, using namespace: "${this.namespace}"`, 'PineconeClient');
  }

}
