import { Module } from '@nestjs/common';
import { join } from 'path';
import { DocumentService } from './document.service';

const Piscina = require('piscina');

@Module({
  providers: [
    DocumentService,
    {
      provide: 'PISCINA', useFactory: () => new Piscina({
        filename: join(__dirname, './document-worker/document-worker.js'),
      })
    }
  ],
  exports: [
    DocumentService,
  ],
})
export class DocumentModule { }
