import { BadRequestException } from '@nestjs/common';
import { BaseDocumentLoader } from '../document-loader/base-document-loader';
import { DocxLoader } from '../document-loader/docx';
import { PDFLoader } from '../document-loader/pdf';
import { TextLoader } from '../document-loader/text';

describe('get-loader', () => {
  let getLoader: (mimetype: string) => BaseDocumentLoader;
  beforeEach(async () => {
    getLoader = (await import('./get-loader')).getLoader;
  });

  it('should be defined', () => {
    expect(getLoader).toBeDefined();
  });

  describe('should return loader', () => {
    it('with .pdf', () => {
      const loader = getLoader('application/pdf');
      expect(loader).toBeInstanceOf(PDFLoader);
    });

    it('with .docx', () => {
      const loader = getLoader('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(loader).toBeInstanceOf(DocxLoader);
    });

    it('with .txt', () => {
      const loader = getLoader('text/plain');
      expect(loader).toBeInstanceOf(TextLoader);
    });

    it('with unsupported type', () => {
      expect(() => getLoader('unsupported')).toThrowError(BadRequestException);
    });
  });
});
