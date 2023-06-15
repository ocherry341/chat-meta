import * as fs from 'fs';
import * as path from 'path';
import { PDFLoader } from './pdf';

describe('PdfSpec', () => {
  let pdfSpec: PDFLoader;
  let buffer: Buffer;

  beforeEach(async () => {
    pdfSpec = new PDFLoader();
    buffer = fs.readFileSync(path.resolve(__dirname, '../../../../test/test-file/pdf.pdf'));
  });

  it('should be defined', () => {
    expect(pdfSpec).toBeDefined();
  });

  it('should load', async () => {
    const res = await pdfSpec.load(buffer);
    expect(res).toContain('test');
    expect(res).toContain('测试');

  });

  it.todo('should loadAndSplit');
});
