import { InsertFileConfigService } from "./insert-file-config.service";

describe('insert-file-config.service', () => {
  let service: InsertFileConfigService;
  let fileFilter: any;
  let callback = jest.fn();
  beforeEach(async () => {
    service = new InsertFileConfigService();
    const options = await service.createMulterOptions();
    fileFilter = options.fileFilter;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return fileFilter', () => {
    expect(fileFilter).toBeDefined();
  });

  describe('should pass fileFilter', () => {

    it('application/pdf', async () => {
      fileFilter(null, { mimetype: 'application/pdf' } as any, callback);
      expect(callback).toBeCalledWith(null, true);
    });

    it('text/plain', async () => {
      fileFilter(null, { mimetype: 'text/plain' } as any, callback);
      expect(callback).toBeCalledWith(null, true);
    });

    it('application/vnd.openxmlformats-officedocument.wordprocessingml.document', async () => {
      fileFilter(null, { mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } as any, callback);
      expect(callback).toBeCalledWith(null, true);
    });
  });

  describe('should not pass fileFilter', () => {
    it('application/json', async () => {
      fileFilter(null, { mimetype: 'application/json' } as any, callback);
      expect(callback).toBeCalledWith(null, false);
    });

    it('application/msword', async () => {
      fileFilter(null, { mimetype: 'application/msword' } as any, callback);
      expect(callback).toBeCalledWith(null, false);
    });
  });

});