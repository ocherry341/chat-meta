import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { OpenaiApiService } from "./openai-api.service";

describe('OpenaiApiService', () => {
  let service: OpenaiApiService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OpenaiApiService,
      ],
      imports: [
        ConfigModule.forRoot(),
      ]
    }).compile();

    service = moduleRef.get<OpenaiApiService>(OpenaiApiService);
  }, 10000);

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEmbedding', () => {
    it('should return an observable with a CreateEmbeddingResponse', () => {
      const result = service.getEmbedding(['test']);
      expect(result).resolves.toHaveProperty('data');
    });

  });

  describe('chat', () => {
    it('should return an observable with a MessageEvent', done => {
      const result = service.chat([{ content: 'say "hello"', role: 'user' }]);
      result.subscribe({
        next: (response) => {
          expect(response).toHaveProperty('data');
          expect(response).toHaveProperty('type');
          done();
        },
      });
    });

    it('should complete the observable if the response contains [DONE]', done => {
      const result = service.chat([{ content: 'say "hello"', role: 'user' }]);
      result.subscribe({
        next: (response) => {
          expect(response).toHaveProperty('data');
          expect(response).toHaveProperty('type');
        },
        complete: () => {
          done();
        }
      });
    }, 20000);

    it.todo('should call with provided model');

  });

});