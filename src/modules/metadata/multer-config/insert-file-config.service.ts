import { Injectable } from "@nestjs/common";
import { MulterOptionsFactory } from "@nestjs/platform-express";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

@Injectable()
export class InsertFileConfigService implements MulterOptionsFactory {

  createMulterOptions(): MulterOptions | Promise<MulterOptions> {
    const acceptted = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    return {
      fileFilter: (req, file, callback) => {
        if (file && acceptted.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },

    };
  }

}