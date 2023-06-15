import { Injectable } from '@nestjs/common';
import { DeleteRequest, QueryRequest, QueryResponse, Vector } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';
import { Observable, catchError, firstValueFrom, forkJoin, map, of, retry } from 'rxjs';
import { PineconeClientService } from '../../config/pinecone-client-module/pinecone-client.service';
import { PineconeUpsertResponse } from '../types/pinecone-upsert-response';

@Injectable()
export class PineconeApiService {

  constructor(
    private readonly pinecone: PineconeClientService,
  ) { }

  upsert(vectors: Vector[], namespace: string): Promise<PineconeUpsertResponse> {
    const vectorsList: Vector[][] = [];
    const max = 100;
    for (let i = 0; i < vectors.length; i += max) {
      vectorsList.push(vectors.slice(i, i + max));
    }

    const obs = vectorsList.map(vector =>
      new Observable<PineconeUpsertResponse>((subscriber) => {
        this.pinecone.index.upsert({
          upsertRequest: {
            vectors: vector,
            namespace: namespace,
          }
        }).then((res) => {
          subscriber.next(res);
          subscriber.complete();
        }).catch((err) => {
          subscriber.error(err);
        });
      }).pipe(
        retry(3),
        catchError((err) => {
          return of({
            upsertedCount: 0,
            failedCount: vector.length,
            failedVectors: vector,
          } as PineconeUpsertResponse);
        })
      )
    );

    const resultObserve = forkJoin(obs).pipe(
      map((res) => {
        const count = res.reduce((acc, cur) => acc + cur?.upsertedCount || 0, 0);
        return {
          upsertedCount: count,
          failedCount: vectors.length - count,
          failedVectors: res.reduce((acc, cur) => acc.concat(cur?.failedVectors || []), [] as Vector[]),
        };
      })
    );

    return firstValueFrom(resultObserve);
  }

  async query(vector: number[], topK: number = 5, namespace: string, filter?: Object): Promise<QueryResponse> {
    if (filter) delete filter['text'];
    const queryRequest: QueryRequest = Object.assign(
      {
        topK: topK,
        vector,
        includeMetadata: true,
        namespace: namespace,
      },
      filter
    );

    try {
      const res = await this.pinecone.index.query({ queryRequest });
      return res;
    } catch (error) {
      throw { error, host: 'Pinecone' };
    }
  }

  async remove(namespace: string, filterOrDeleteAll: Object | boolean): Promise<object> {
    let deleteRequest: DeleteRequest;
    if (typeof filterOrDeleteAll === 'boolean') {
      deleteRequest = { namespace, deleteAll: filterOrDeleteAll };
    } else {
      delete filterOrDeleteAll['text'];
      deleteRequest = { namespace, filter: filterOrDeleteAll };
    }
    try {
      const res = await this.pinecone.index._delete({ deleteRequest });
      return res;
    } catch (error) {
      throw { error, host: 'Pinecone' };
    }
  }

}
