import { BaseDocumentLoader } from "./base-document-loader";

export class TextLoader extends BaseDocumentLoader {
  async load(buffer: Buffer): Promise<string> {
    return buffer.toString();
  }
}