
export abstract class BaseDocumentLoader {

  constructor() { }

  abstract load(buferr: Buffer): Promise<string>;

}