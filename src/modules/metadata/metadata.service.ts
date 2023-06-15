import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryResponse } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';
import { nanoid } from 'nanoid';
import { OpenaiApiService } from '../../common/services/openai-api.service';
import { PineconeApiService } from '../../common/services/pinecone-api.service';
import { PineconeMetadata } from '../../common/types/pinecone-metadata';
import { DocumentService } from '../document/document.service';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class MetadataService {

  constructor(
    private readonly pineconeApiService: PineconeApiService,
    private readonly openaiApiService: OpenaiApiService,
    private readonly configService: ConfigService,
    private readonly documentService: DocumentService,
  ) { }

  private readonly namespace = this.configService.get<string>('PIENCONE_NAMESPACE') || "";

  async insert(body: PineconeMetadata) {
    const chunks = await this.documentService.split(body.text);
    return this.insertRaw(chunks, body);
  }

  async insertFile(body: Partial<PineconeMetadata>, file: Express.Multer.File) {
    const chunks = await this.documentService.loadAndSplit(file);
    return this.insertRaw(chunks, body);
  }

  async insertRaw(chunks: string[], metadata: Partial<PineconeMetadata>, namespace: string = this.namespace) {
    delete metadata.text;
    try {
      const embeddingRes = await this.openaiApiService.getEmbedding(chunks);
      const vectors = embeddingRes.data.map(({ embedding }) => ({
        id: nanoid(),
        values: embedding,
        metadata: metadata,
      }));
      const upsertRes = await this.pineconeApiService.upsert(vectors, namespace);
      return upsertRes;
    } catch (error) {
      throw new BadGatewayException(`${error.host} Error: ${error.error.message}`);
    }
  }

  async query(dto: QueryDto, filter?: Object,): Promise<QueryResponse> {
    const defaultTopK = 5;
    const namespace = this.namespace;

    try {
      const embeddingRes = await this.openaiApiService.getEmbedding([dto.text]);
      const vector = embeddingRes.data[0].embedding;
      const queryRes = await this.pineconeApiService.query(vector, dto.topK ?? defaultTopK, namespace, filter);
      return queryRes;
    } catch (error) {
      const msg: string = error?.error.message || 'UnCaught Error';
      if (msg.includes('illegal condition for field invalid')) {
        throw new BadRequestException(`${error.host} Error: ${msg}`);
      } else {
        throw new BadGatewayException(`${error.host} Error: ${msg}`);
      }
    }
  }

  async remove({ namespace, deleteAll, filter }: { namespace?: string; deleteAll?: boolean; filter?: Object; } = {}) {
    const space = namespace || this.namespace;
    let res: object;
    try {
      if (deleteAll) {
        res = await this.pineconeApiService.remove(space, true);
      } else {
        res = await this.pineconeApiService.remove(space, filter);
      }
      return res;
    } catch (error) {
      const msg: string = error?.error.message || 'UnCaught Error';
      if (msg.includes('illegal condition for field invalid')) {
        throw new BadRequestException(`${error.host} Error: ${msg}`);
      } else {
        throw new BadGatewayException(`${error.host} Error: ${msg}`);
      }
    }
  }

}
