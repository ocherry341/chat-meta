import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { MetadataController } from "./metadata.controller";
import { MetadataService } from "./metadata.service";

describe("MetadataController", () => {
  let controller: MetadataController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MetadataController],
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({}),
      ],
    })
      .useMocker((token) => {
        if (token === MetadataService) {
          return {
            insert: jest.fn().mockResolvedValue({}),
            insertFile: jest.fn().mockResolvedValue({}),
            insertRaw: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue({}),
          };
        }
      })
      .compile();
    controller = moduleRef.get<MetadataController>(MetadataController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("upsert", () => {
    it("should return", () => {
      const result = {};
      expect(controller.insert({ text: 'hi' })).resolves.toEqual(result);
    });
  });

  describe("upsertFile", () => {
    it("should return", () => {
      const result = {};
      const file: Express.Multer.File = {
        fieldname: "",
        originalname: "",
        encoding: "",
        mimetype: "",
        size: 0,
        stream: null,
        destination: "",
        filename: "",
        path: "",
        buffer: Buffer.from("hi"),
      };
      expect(controller.insertFile({ author: 'me' }, file)).resolves.toEqual(result);
    });
  });

  describe("query", () => {
    it("should return", () => {
      const result = {};
      expect(controller.query({ text: 'hi' })).resolves.toEqual(result);
    });
  });

});