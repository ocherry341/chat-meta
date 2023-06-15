import * as pdf from "pdf-parse";
import { BaseDocumentLoader } from "./base-document-loader";

export class PDFLoader extends BaseDocumentLoader {
  async load(buffer: Buffer): Promise<string> {
    const result = await pdf(buffer);
    // meta data
    // result.info["Authors"]; // "author"
    // result.info["CreationDate"]; // "D:20230603225101+08'00'"
    // result.info["Creator"]; // "Microsoft® Word 2016"
    return result.text;
  }
}