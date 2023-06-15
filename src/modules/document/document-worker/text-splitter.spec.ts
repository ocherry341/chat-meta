import * as fs from 'fs';
import { join } from "path";
import { TextSplitter } from "./text-splitter";

describe('text-splitter', () => {
  let textSplitterSpec: TextSplitter;
  const text = fs.readFileSync(join(__dirname, '../../../../test/test-file/long-text.txt'), 'utf8');

  it('should be defined', () => {
    textSplitterSpec = new TextSplitter();
    expect(textSplitterSpec).toBeDefined();
  });

  it('should split text', async () => {
    const chunkSize = 450;
    textSplitterSpec = new TextSplitter({ chunkSize });
    const result = await textSplitterSpec.split(text);
    const chunkInSize = result.every((chunk) => (textSplitterSpec as any).getLength(chunk) <= chunkSize + 30);
    expect(chunkInSize).toBeTruthy();
  });

  it('should split text with chunk header', async () => {
    const chunkSize = 300;
    textSplitterSpec = new TextSplitter({ chunkSize, chunkHeader: 'chunk header\n' });
    const result = await textSplitterSpec.split(text);
    const chunkInSize = result.every((chunk) => (textSplitterSpec as any).getLength(chunk) <= chunkSize + 30);
    const chunkWithHeader = result.every((chunk) => chunk.includes('chunk header\n'));
    expect(chunkInSize).toBeTruthy();
    expect(chunkWithHeader).toBeTruthy();
  });
});
