import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentModule } from '../document/document.module';
import { InsertFileConfigService } from './multer-config/insert-file-config.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: InsertFileConfigService,
    }),
    DocumentModule,
  ],
  controllers: [
    MetadataController,
  ],
  providers: [
    MetadataService,
  ],
  exports: [
    MetadataService,
  ],
})
export class MetadataModule { }
