import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { of } from "rxjs";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ChatDto } from "./dto/chat.dto";

describe('ChatController', () => {
  let controller: ChatController;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ChatController],
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({}),
      ],
    })
      .useMocker((token) => {
        if (token === ChatService) {
          return { chat: jest.fn().mockReturnValue(of({})) };
        }
      })
      .compile();
    controller = moduleRef.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    it('should return observable of object', (done) => {
      const chatDto: ChatDto = { messages: [{ content: 'test', role: 'user' }] };
      const result = {};
      controller.chat(chatDto).subscribe(res => {
        expect(res).toEqual(result);
        done();
      });
    });
  });
});