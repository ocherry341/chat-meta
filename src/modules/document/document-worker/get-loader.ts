import { BadRequestException } from "@nestjs/common";
import { BaseDocumentLoader } from "../document-loader/base-document-loader";
import { DocxLoader } from "../document-loader/docx";
import { PDFLoader } from "../document-loader/pdf";
import { TextLoader } from "../document-loader/text";

export function getLoader(mimetype: string): BaseDocumentLoader {
  switch (mimetype) {
    case 'application/pdf':
      return new PDFLoader();
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return new DocxLoader();
    case 'text/plain':
      return new TextLoader();

    default:
      throw new BadRequestException('Unsupported file type');
  }
}