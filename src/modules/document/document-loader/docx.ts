import { extractRawText } from "mammoth";
import { BaseDocumentLoader } from "./base-document-loader";

export class DocxLoader extends BaseDocumentLoader {
  async load(buffer: Buffer): Promise<string> {
    const result = await extractRawText({ buffer });
    return result.value;
  }
}