import { HttpStatus, INestApplication } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import * as bodyParser from 'body-parser';
import { join } from "path";
import { ChatModule } from "src/modules/chat/chat.module";
import * as request from 'supertest';
import { CommonModule } from "../../src/common/common.module";
import { validate } from "../../src/config/env.validation";

describe('[Feature] Metadata', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const Piscina = require('piscina');
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ChatModule,
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

  describe('[POST /chat]', () => {
    describe('should success', () => {
      it('with messages', async () => {
        const res = await request(app.getHttpServer())
          .post('/chat')
          .send({
            messages: [
              { role: 'user', content: 'I want to buy a car', },
            ]
          })
          .expect(HttpStatus.OK);
        expect(res.text).toBeTruthy();
      });

      it('with messages and model', async () => {
        const res = await request(app.getHttpServer())
          .post('/chat')
          .send({
            messages: [
              { role: 'user', content: 'I want to buy a car', },
            ],
            model: 'gpt-3.5-turbo-16k',
          })
          .expect(HttpStatus.OK);
        expect(res.text).toBeTruthy();
      });

      it('with messages and filter', async () => {
        const res = await request(app.getHttpServer())
          .post('/chat')
          .send({
            messages: [
              { role: 'user', content: 'I want to buy a car', },
            ],
            model: 'gpt-3.5-turbo-16k',
            filter: { author: { '$in': ['author1', 'author2'] } }
          })
          .expect(HttpStatus.OK);
        expect(res.text).toBeTruthy();
      });
    });

    describe('should throw a BadRequestException', () => {
      it('when the body is empty', async () => {
        return request(app.getHttpServer())
          .post('/chat')
          .send({})
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('when the messages.role is not valid', async () => {
        return request(app.getHttpServer())
          .post('/chat')
          .send({
            messages: [
              { role: 'invalid', content: 'I want to buy a car', },
            ]
          })
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
          .post('/chat')
          .set('Authorization', `Bearer invalid`)
          .send({
            messages: [
              { role: 'user', content: 'I want to buy a car', },
            ]
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('when the token is empty', async () => {
        return request(app.getHttpServer())
          .post('/chat')
          .send({
            messages: [
              { role: 'user', content: 'I want to buy a car', },
            ]
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('should success', () => {
      it('with valid token', async () => {
        const res = await request(app.getHttpServer())
          .post('/chat')
          .set('Authorization', `Bearer ${token}`)
          .send({
            messages: [
              { role: 'user', content: 'I want to buy a car', },
            ]
          })
          .expect(HttpStatus.OK);
        expect(res.text).toBeTruthy();
      });
    });
  });

});