import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import Piscina from "piscina";

@Injectable()
export class DocumentService implements OnModuleDestroy {
  constructor(
    @Inject('PISCINA') private readonly piscina: Piscina,
  ) { }

  onModuleDestroy() {
    this.piscina.destroy();
  }

  async loadAndSplit(file: Express.Multer.File): Promise<string[]> {
    try {
      const result: string[] = await this.piscina.run(file, { name: 'loadAndSplit' });
      return result;
    } catch (error) {
      //TODO handle error
      throw error;
    }
  }

  async split(text: string): Promise<string[]> {
    try {
      const result: string[] = await this.piscina.run(text, { name: 'split' });
      return result;
    } catch (error) {
      //TODO handle error
      throw error;
    }
  }

}