import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PineconeMetadata } from 'src/common/types/pinecone-metadata';

interface Option {
  /**
   * Require the 'text' property to be a string
   */
  requireText?: boolean;
  /**
   * Require the metadata to be an object
   */
  required?: boolean;
}

@Injectable()
export class MetadataPipe implements PipeTransform {

  constructor(private option: Option = {}) {
    this.option = Object.assign({}, { requireText: true, required: true }, option);
  }

  private validate(value: PineconeMetadata, requireText: boolean, index?: number) {
    const errs: string[] = [];
    if (value === undefined) {
      const msg = index !== undefined
        ? `property at index [${index}] is required`
        : `property is required`;
      errs.push(msg);
      return this.option.required ? errs : [];
    }

    if (typeof value !== 'object') {
      const msg = index !== undefined
        ? `property at index [${index}] must be an object`
        : `property must be an object`;
      errs.push(msg);
      return errs;
    }

    if (requireText && (typeof value.text !== 'string' || value.text.length === 0)) {
      const msg = index !== undefined
        ? `property 'text' at index [${index}] must be a string`
        : `property 'text' must be a string`;
      errs.push(msg);
    }
    Object.entries(value).forEach(([key, value]) => {
      if (key !== 'text') {
        if (typeof value !== 'number'
          && typeof value !== 'string'
          && typeof value !== 'boolean'
          && !(Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string'))) {
          const msg = index !== undefined
            ? `property '${key}' at index [${index}] must be a string, number, boolean, or array of strings`
            : `property '${key}' must be a string, number, boolean, or array of strings`;
          errs.push(msg);
        }
      }
    });
    return errs;
  }

  transform(value: PineconeMetadata | PineconeMetadata[]) {
    let errs: string[] = [];

    if (!Array.isArray(value)) {
      errs = this.validate(value, this.option.requireText);
    } else {
      value.forEach((v, i) => {
        errs = errs.concat(this.validate(v, this.option.requireText, i));
      });
    }

    if (errs.length > 0) {
      throw new BadRequestException(errs);
    } else {
      return value;
    }
  }

}
