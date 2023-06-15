import { BadRequestException } from '@nestjs/common';
import { PDFLoader } from '../document-loader/pdf';
import { TextSplitter } from './text-splitter';


jest.spyOn(TextSplitter.prototype, 'split')
  .mockImplementation((text: string) => Promise.resolve([`splited1-${text}`, `splited2-${text}`, `splited3-${text}`]));
jest.spyOn(PDFLoader.prototype, 'load')
  .mockImplementation((buffer: Buffer) => Promise.resolve(buffer.toString()));

describe('document-worker', () => {
  let loadAndSplit: (file: Express.Multer.File) => Promise<string[]>;
  let split: (text: string) => Promise<string[]>;
  let file: Express.Multer.File;

  beforeEach(() => {
    loadAndSplit = jest.requireActual('./document-worker').loadAndSplit;
    split = jest.requireActual('./document-worker').split;
    file = {
      buffer: Buffer.from('test'),
      mimetype: 'application/pdf',
    } as Express.Multer.File;
  });

  describe('loadAndSplit', () => {
    it('should be defined', () => {
      expect(loadAndSplit).toBeDefined();
    });

    it('should success', async () => {
      const data = await loadAndSplit(file);
      expect(TextSplitter.prototype.split).toHaveBeenCalledWith('test');
      expect(data).toEqual([
        'splited1-test',
        'splited2-test',
        'splited3-test',
      ]);
    });

    it('should throw error with unsupported type', () => {
      file.mimetype = 'application/msword';
      expect(loadAndSplit(file)).rejects.toThrowError(BadRequestException);
    });
  });


  describe('split', () => {
    it('should be defined', () => {
      expect(split).toBeDefined();
    });

    it('should success', async () => {
      const data = await split('test');
      expect(TextSplitter.prototype.split).toHaveBeenCalledWith('test');
      expect(data).toEqual([
        'splited1-test',
        'splited2-test',
        'splited3-test',
      ]);
    });
  });
});

