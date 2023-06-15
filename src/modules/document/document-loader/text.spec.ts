import * as fs from 'fs';
import * as path from 'path';
import { TextLoader } from './text';

describe('TextSpec', () => {
  let textSpec: TextLoader;
  let buffer: Buffer;
  beforeEach(async () => {
    textSpec = new TextLoader();
    buffer = fs.readFileSync(path.resolve(__dirname, '../../../../test/test-file/text.txt'));
  });

  it('should be defined', () => {
    expect(textSpec).toBeDefined();
  });

  it('should load', done => {
    textSpec.load(buffer).then((string) => {
      expect(string).toContain('test');
      expect(string).toContain('测试');
      done();
    });
  });

  it.todo('should loadAndSplit');
});
