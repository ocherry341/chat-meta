import { BadRequestException, Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PineconeMetadata } from '../../common/types/pinecone-metadata';
import { QueryDto } from './dto/query.dto';
import { RemoveDto } from './dto/remove.dto';
import { MetadataService } from './metadata.service';
import { MetadataPipe } from './pipes/metadata.pipe';

@UseGuards(AuthGuard)
@Controller()
export class MetadataController {
  constructor(
    private readonly metadataService: MetadataService,
  ) { }

  @Post('insert')
  insert(@Body(new MetadataPipe()) body: PineconeMetadata) {
    return this.metadataService.insert(body);
  }

  @Post('insert-file')
  @UseInterceptors(FileInterceptor('file'))
  insertFile(
    @Body(new MetadataPipe({ requireText: false, required: false })) body: Partial<PineconeMetadata>,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException('unsupported file type');
    if (body.text) delete body.text;
    return this.metadataService.insertFile(body, file);
  }

  @Post('query')
  query(
    @Body(new ValidationPipe({ whitelist: true })) body: QueryDto,
  ) {
    return this.metadataService.query(body, body.filter);
  }

  @Post('remove')
  remove(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: RemoveDto,
  ) {
    return this.metadataService.remove(Object.assign({}, body, { filter: body.filter }));
  }

}
