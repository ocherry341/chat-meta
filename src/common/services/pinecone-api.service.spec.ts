import { Test } from "@nestjs/testing";
import { DeleteOperationRequest, QueryResponse, UpsertOperationRequest, UpsertResponse } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";
import { nanoid } from "nanoid";
import { PineconeClientService } from "src/config/pinecone-client-module/pinecone-client.service";
import { PineconeMetadata } from "../types/pinecone-metadata";
import { PineconeApiService } from "./pinecone-api.service";

const mockVector = Array(1536).fill(0);

class TestVector {
  constructor() {
    this.id = nanoid();
    this.values = mockVector;
    this.metadata = {
      test: 'test',
    };
  }
  id: string;
  values: number[];
  metadata: any;
}

describe('PineconeApiService', () => {
  let service: PineconeApiService;
  const mockPineconeClientService = {
    index: {
      upsert: jest.fn(),
      query: jest.fn(),
      _delete: jest.fn(),
    }
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PineconeApiService,
        {
          provide: PineconeClientService,
          useValue: mockPineconeClientService,
        }
      ],
    }).compile();

    service = moduleRef.get<PineconeApiService>(PineconeApiService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsert', () => {
    describe('if call pinecone success', () => {
      it('should return an observable with a PineconeUpsertResponse', async () => {
        mockPineconeClientService.index.upsert.mockImplementation((p: UpsertOperationRequest) => Promise.resolve({
          upsertedCount: p.upsertRequest.vectors.length,
          failedCount: 0,
          failedVectors: [],
        } as UpsertResponse));

        const result = await service.upsert(Array(264).fill(new TestVector()), 'test2');
        expect(result.upsertedCount).toBe(264);
        expect(result.failedCount).toBe(0);
        expect(result.failedVectors).toHaveLength(0);
      });
    });

    describe('if call pinecone failed', () => {
      it('should return an observable with a PineconeUpsertResponse with failed vectors', async () => {
        mockPineconeClientService.index.upsert.mockImplementation((p: UpsertOperationRequest) => Promise.resolve({
          upsertedCount: 0,
          failedCount: p.upsertRequest.vectors.length,
          failedVectors: p.upsertRequest.vectors,
        } as UpsertResponse));

        const result = await service.upsert(Array(264).fill(new TestVector()), 'test2');
        expect(result.upsertedCount).toBe(0);
        expect(result.failedCount).toBe(264);
        expect(result.failedVectors).toHaveLength(264);
      });
    });
  });

  describe('query', () => {
    it('should return an observable with a QueryResponse', () => {
      mockPineconeClientService.index.query.mockResolvedValue({ matches: [{ id: 'test' }] } as QueryResponse);
      const result = service.query(mockVector, 5, 'test');
      expect(result).resolves.toHaveProperty('matches');
    });
  });

  describe('remove', () => {
    describe('if use boolean', () => {
      it('should return an observable with {}', () => {
        mockPineconeClientService.index._delete.mockImplementation((p: DeleteOperationRequest) => Promise.resolve({}));
        const result = service.remove('test', true);
        expect(result).resolves.toBeInstanceOf(Object);
      });
    });

    describe('if use filter', () => {
      it('should return an observable with {}', () => {
        mockPineconeClientService.index._delete.mockImplementation((p: DeleteOperationRequest) => Promise.resolve({}));
        const result = service.remove('test', { author: 'me' } as Partial<PineconeMetadata>);
        expect(result).resolves.toBeInstanceOf(Object);
      });
    });
  });
});