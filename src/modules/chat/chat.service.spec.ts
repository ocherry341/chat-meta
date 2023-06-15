import { Test } from "@nestjs/testing";
import { ChatCompletionRequestMessage } from "openai";
import { of } from "rxjs";
import { OpenaiApiService } from "src/common/services/openai-api.service";
import { QueryDto } from "../metadata/dto/query.dto";
import { MetadataService } from "../metadata/metadata.service";
import { ChatService } from "./chat.service";
import { CHAT_WITH_CONTEXT_PROMPT } from "./prompt/chat-with-context-prompt";

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ChatService],
    })
      .useMocker((token) => {
        if (token === OpenaiApiService) {
          return {
            chat: jest.fn().mockImplementation((msg: ChatCompletionRequestMessage[]) => {
              const lastMessage = msg[msg.length - 1];
              const otherMessages = msg.slice(0, msg.length - 1).map((m, i) => ({
                id: `${i + 1}`,
                type: 'message',
                data: `${m.role}: ${m.content}`
              }));
              return of(
                ...otherMessages,
                { id: `${msg.length}`, type: 'message', data: `last message: ${lastMessage.role}: ${lastMessage.content}` },
              );
            })
          };
        }
        if (token === MetadataService) {
          return {
            query: jest.fn().mockImplementation((dto: QueryDto) => of({
              matches: [{ id: 'test', metadata: { text: dto.text } }],
              namespace: 'test',
              results: [],
            }))
          };
        }

      })
      .compile();

    service = moduleRef.get<ChatService>(ChatService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chat', () => {
    it('should return a message', (done) => {
      const messages: ChatCompletionRequestMessage[] = [{ role: 'user', content: 'Hello' }, { role: 'user', content: 'This is Context and Qusetion' }];
      const result = [];
      service.chat({ messages: JSON.parse(JSON.stringify(messages)) }).subscribe({
        next: (message) => {
          result.push(message);
        },
        complete: () => {
          expect(result.length).toBe(messages.length + 1);
          expect(result[result.length - 1].data).toMatch(/[\s\S]*'context'[\s\S]*'question'/);
          expect(result[result.length - 1].data).toContain('This is Context and Qusetion');
          expect(result[0].data).toContain('system:');
          expect(result[0].data).toContain(CHAT_WITH_CONTEXT_PROMPT);
          done();
        }
      });
    });

  });


});