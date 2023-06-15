import * as fs from 'fs';
import * as path from 'path';
import { DocxLoader } from './docx';

describe('DocxSpec', () => {
  let docxSpec: DocxLoader;
  let buffer: Buffer;

  beforeEach(async () => {
    docxSpec = new DocxLoader();
  });

  it('should be defined', () => {
    expect(docxSpec).toBeDefined();
  });

  it('should load doc', done => {
    buffer = fs.readFileSync(path.join(__dirname, '../../../../test/test-file/docx.docx'));
    docxSpec.load(buffer).then((string) => {
      expect(string).toContain('test');
      expect(string).toContain('测试');
      done();
    });
  });

  it.todo('should loadAndSplit');
});
