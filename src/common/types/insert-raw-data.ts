import { PineconeMetadata } from "./pinecone-metadata";

export interface InsertRawData {
  chunks: string[],
  metadata: PineconeMetadata;
}