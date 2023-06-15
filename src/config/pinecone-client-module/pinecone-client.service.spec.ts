import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { PineconeClientService } from "./pinecone-client.service";


describe('PineconeClientService', () => {
  let service: PineconeClientService;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PineconeClientService,
      ],
      imports: [
        ConfigModule.forRoot(),
      ],
    }).compile();
    service = moduleRef.get<PineconeClientService>(PineconeClientService);
    configService = moduleRef.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init client and index', async () => {
    await service.onModuleInit();
    expect(service.index).toBeDefined();
    expect(service.index).toHaveProperty('configuration');
    expect(service.client).toBeDefined();
    expect(service.client).toHaveProperty('projectName');
  }, 10000);

  it('should throw error when create failed', () => {
    jest.spyOn(configService, 'get').mockReturnValueOnce('invalid config');
    expect(service.onModuleInit()).rejects.toThrowError();
  });
});