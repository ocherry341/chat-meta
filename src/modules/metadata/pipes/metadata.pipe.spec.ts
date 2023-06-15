import { BadRequestException } from "@nestjs/common";
import { PineconeMetadata } from "src/common/types/pinecone-metadata";
import { MetadataPipe } from "./metadata.pipe";

describe('MetadataPipe', () => {
  let pipe: MetadataPipe;
  beforeEach(() => {
    pipe = new MetadataPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    describe('should return PineconeMetadata', () => {
      describe('with default options', () => {
        it('when input is object', () => {
          const value: PineconeMetadata = { text: 'test' };
          expect(pipe.transform(value)).toEqual(value);
        });

        it('with input is array', () => {
          const value: PineconeMetadata[] = [
            { text: 'test' },
            { text: 'test with some metadata', number: 1, boolean: true, array: ['test', 'test2'] },
          ];
          expect(pipe.transform(value)).toEqual(value);
        });
      });

      describe('with requireText = false', () => {
        beforeEach(() => {
          pipe = new MetadataPipe({ requireText: false });
        });

        it('when input is object', () => {
          // @ts-ignore
          const value: PineconeMetadata = { valid: 'test' };
          expect(pipe.transform(value)).toEqual(value);
        });

        it('with input is array', () => {
          const value: PineconeMetadata[] = [
            // @ts-ignore
            { valid: 'test' },
            // @ts-ignore
            { valid: 'test with some metadata', number: 1, boolean: true, array: ['test', 'test2'] },
          ];
          expect(pipe.transform(value)).toEqual(value);
        });
      });

      describe('with required = false', () => {
        beforeEach(() => {
          pipe = new MetadataPipe({ required: false });
        });

        it('when input is undefined', () => {
          expect(pipe.transform(undefined)).toEqual(undefined);
        });
      });
    });

    describe('should throw a BadRequestException', () => {
      it('when input is not an object or array', () => {
        expect(() => (pipe as any).transform('test')).toThrowError(BadRequestException);
      });

      it('when input is undefined', () => {
        expect(() => (pipe as any).transform()).toThrowError(BadRequestException);
      });

      describe('when input is an object', () => {
        it('but input.text not a string', () => {
          expect(() => (pipe as any).transform({ text: 1 })).toThrowError(BadRequestException);
        });

        it('but input.text an empty string', () => {
          expect(() => (pipe as any).transform({ text: '' })).toThrowError(BadRequestException);
        });

        it('but has other invalid properties', () => {
          expect(() => (pipe as any).transform({ text: 'test', invalid: [1, 2] })).toThrowError(BadRequestException);
        });
      });

      describe('when input is an array', () => {
        it('but not an array of objects', () => {
          expect(() => (pipe as any).transform([{ text: 'valid' }, 'test'])).toThrowError(BadRequestException);
        });

        it('but input.text is not a string', () => {
          expect(() => (pipe as any).transform([{ text: 'valid' }, { text: 1 }])).toThrowError(BadRequestException);
        });

        it('but input.text is an empty string', () => {
          expect(() => (pipe as any).transform([{ text: 'valid' }, { text: '' }])).toThrowError(BadRequestException);
        });

        it('but has other invalid properties', () => {
          expect(() => (pipe as any).transform([{ text: 'valid' }, { text: 'test', invalid: [1, 2] }])).toThrowError(BadRequestException);
        });

      });
    });
  });

});

