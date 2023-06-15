import { Test } from '@nestjs/testing';
import { DocumentService } from './document.service';

describe('document.service', () => {
  let service: DocumentService;
  let mockPiscina = { run: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: 'PISCINA', useValue: mockPiscina },
      ],
    }).compile();

    service = moduleRef.get(DocumentService);
  });

  describe('loadAndSplit', () => {

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should success', () => {
      const mockResult = ['test'];
      mockPiscina.run.mockResolvedValue(mockResult);
      const file: Express.Multer.File = { filename: 'file' } as Express.Multer.File;
      const result = service.loadAndSplit(file);
      expect(mockPiscina.run).toBeCalledWith(file, { "name": "loadAndSplit" });
      expect(result).resolves.toBe(mockResult);
    });
  });

  describe('split', () => {

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should success', () => {
      const mockResult = ['test'];
      mockPiscina.run.mockResolvedValue(mockResult);
      const text = 'text';

      const result = service.split(text);
      expect(mockPiscina.run).toBeCalledWith(text, { "name": "split" });
      expect(result).resolves.toBe(mockResult);
    });
  });
});
