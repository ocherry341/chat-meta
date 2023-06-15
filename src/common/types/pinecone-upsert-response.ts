import { Vector } from "@pinecone-database/pinecone";

export interface PineconeUpsertResponse {
  upsertedCount?: number;
  failedCount?: number;
  failedVectors?: Vector[];
}