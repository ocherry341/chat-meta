import { HttpStatus, INestApplication } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import * as bodyParser from 'body-parser';
import { join } from "path";
import * as request from 'supertest';
import { CommonModule } from "../../src/common/common.module";
import { validate } from "../../src/config/env.validation";
import { MetadataModule } from "../../src/modules/metadata/metadata.module";

describe('[Feature] Metadata', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const Piscina = require('piscina');
    const moduleFixture = await Test.createTestingModule({
      imports: [
        MetadataModule,
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
        }),
        CommonModule.forRoot(),
      ],
    })
      .overrideProvider('PISCINA')
      .useFactory({
        factory: () => new Piscina({
          filename: join(__dirname, '../../dist/modules/document/document-worker/document-worker.js'),
        })
      })
      .compile();
    app = moduleFixture.createNestApplication();
    app.use(bodyParser.json({ limit: '10mb' }));
    await app.init();
  });


  afterAll(async () => {
    await app.close();
  });

  describe('[POST /insert]', () => {
    describe('should insert metadata', () => {
      it('with only text property', async () => {
        const { body } = await request(app.getHttpServer())
          .post('/insert')
          .send({ text: 'This is some test text expect to pass the suit' })
          .expect(HttpStatus.CREATED);
        expect(body.upsertedCount).toEqual(1);
      });

      it('with other properties', async () => {
        const { body } = await request(app.getHttpServer())
          .post('/insert')
          .send({ text: 'This is some test text expect to pass the suit', number: 1, boolean: true, array: ['test', 'test2'] })
          .expect(HttpStatus.CREATED);
        expect(body.upsertedCount).toEqual(1);
      });
    });

    describe('should throw a BadRequestException', () => {
      it('when the body is not an object', () => {
        return request(app.getHttpServer())
          .post('/insert')
          .send('This is some test text expect to pass the suit')
          .expect(HttpStatus.BAD_REQUEST);
      });

      describe('when the body is an object', () => {
        it('but text property but not a string', () => {
          return request(app.getHttpServer())
            .post('/insert')
            .send({ text: 14432543524143 })
            .expect(HttpStatus.BAD_REQUEST);
        });

        it('but text property but an empty string', () => {
          return request(app.getHttpServer())
            .post('/insert')
            .send({ text: '' })
            .expect(HttpStatus.BAD_REQUEST);
        });

        it('but has other invalid properties', () => {
          return request(app.getHttpServer())
            .post('/insert')
            .send({ text: 'test', invalid: [1, 2] })
            .expect(HttpStatus.BAD_REQUEST);
        });
      });

    });
  });


  describe('[POST /insert-file]', () => {
    describe('should insert file with valid file', () => {
      it('.txt', async () => {
        const { body } = await request(app.getHttpServer())
          .post('/insert-file')
          .attach('file', 'test/test-file/text.txt')
          .field('user', 'user1')
          .expect(HttpStatus.CREATED);
        expect(body.upsertedCount).toEqual(1);
      });

      it('.docx', async () => {
        const { body } = await request(app.getHttpServer())
          .post('/insert-file')
          .attach('file', 'test/test-file/docx.docx')
          .field('boolean', true)
          .expect(HttpStatus.CREATED);
        expect(body.upsertedCount).toEqual(1);
      });

      it('.pdf', async () => {
        const { body } = await request(app.getHttpServer())
          .post('/insert-file')
          .attach('file', 'test/test-file/pdf.pdf')
          .field('number', 1)
          .expect(HttpStatus.CREATED);
        expect(body.upsertedCount).toEqual(1);
      });
    });

    describe('should throw a BadRequestException', () => {
      it('when the file field not exists', () => {
        return request(app.getHttpServer())
          .post('/insert-file')
          .field('user', 'user1')
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('when the file is not a valid file', () => {
        return request(app.getHttpServer())
          .post('/insert-file')
          .attach('file', 'test/test-file/doc.doc')
          .field('user', 'user1')
          .expect(HttpStatus.BAD_REQUEST);
      });

    });
  });

  describe('[POST /query]', () => {
    describe('should return query results', () => {
      it('with only text property', () => {
        return request(app.getHttpServer())
          .post('/query')
          .send({ text: 'test text' })
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            expect(body.matches.length).toEqual(5);
          });
      });

      it('with text and topK property', () => {
        const topK = 2;
        return request(app.getHttpServer())
          .post('/query')
          .send({ text: 'test text', topK: topK })
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            expect(body.matches.length).toEqual(topK);
          });
      });
    });

    describe('should throw a BadRequestException', () => {
      it('when the body is not an object', () => {
        return request(app.getHttpServer())
          .post('/query')
          .send('This is some test text expect to pass the suit')
          .expect(HttpStatus.BAD_REQUEST);
      });

      describe('when the body is an object', () => {
        it('but text property but not a string', () => {
          return request(app.getHttpServer())
            .post('/query')
            .send({ text: 14432543524143 })
            .expect(HttpStatus.BAD_REQUEST);
        });

        it('but text property but an empty string', () => {
          return request(app.getHttpServer())
            .post('/query')
            .send({ text: '' })
            .expect(HttpStatus.BAD_REQUEST);
        });

        it('but has other invalid properties', () => {
          return request(app.getHttpServer())
            .post('/query')
            .send({ text: 'test', topK: 'test' })
            .expect(HttpStatus.BAD_REQUEST);
        });
      });

    });

  });

  describe('[POST /remove]', () => {
    describe('should remove metadata', () => {
      it('with metadata filter', () => {
        return request(app.getHttpServer())
          .post('/remove')
          .send({ namespace: 'testRemove', filter: { author: 'me' } })
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            expect(body).toEqual({});
          });

      });

      it('with deleteAll', () => {
        return request(app.getHttpServer())
          .post('/remove')
          .send({ namespace: 'testRemove', deleteAll: true })
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            expect(body).toEqual({});
          });
      });
    });

    describe('should throw a BadRequestException', () => {

      it('namespace is not a string', () => {
        return request(app.getHttpServer())
          .post('/remove')
          .send({ namespace: 1 })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('deleteAll is not a boolean', () => {
        return request(app.getHttpServer())
          .post('/remove')
          .send({ namespace: 'testRemove', deleteAll: 'test' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('filter has invalid properties', () => {
        return request(app.getHttpServer())
          .post('/remove')
          .send({ namespace: 'testRemove', filter: { invalid: [1, 2] } })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('have both deleteAll and filter', () => {
        return request(app.getHttpServer())
          .post('/remove')
          .send({ namespace: 'testRemove', deleteAll: true, filter: { author: 'me' } })
          .expect(HttpStatus.BAD_REQUEST);
      });

    });

  });

  describe('Authorization', () => {
    let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG4iLCJzdWIiOjEsImlhdCI6MTY4NjgxMjU2MCwiZXhwIjoyMDAyMzg4NTYwfQ.18PLXgR4WXKRux8OSPivlEDOoiJUYRQyUyQ3ksb8MGs';
    let secret = 'abcd';
    let configService: ConfigService;

    beforeEach(async () => {
      configService = app.get(ConfigService);
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return secret;
        return process.env[key];
      });
    });

    describe('should throw a UnauthorizedException', () => {
      it('when the token is invalid', () => {
        return request(app.getHttpServer())
          .post('/query')
          .set('Authorization', `Bearer invalid`)
          .send({ text: 'test text' })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('when the token is empty', async () => {
        return request(app.getHttpServer())
          .post('/query')
          .send({ text: 'test text' })
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('should success', () => {
      it('with valid token', async () => {
        const res = await request(app.getHttpServer())
          .post('/query')
          .set('Authorization', `Bearer ${token}`)
          .send({ text: 'test text' })
          .expect(HttpStatus.CREATED);
        expect(res.text).toBeTruthy();
      });
    });
  });

});