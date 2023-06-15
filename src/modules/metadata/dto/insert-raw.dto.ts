import { Allow } from "class-validator";
import { PineconeMetadata } from "src/common/types/pinecone-metadata";


export class InsertRawDto {
  @Allow()
  raw: PineconeMetadata[];
}