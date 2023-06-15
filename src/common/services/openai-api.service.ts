import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatCompletionRequestMessage, Configuration, CreateEmbeddingResponse, OpenAIApi } from 'openai';
import { Observable } from 'rxjs';

@Injectable()
export class OpenaiApiService {

  constructor(
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const basePath = this.configService.get<string>('OPENAI_API_BASE_URL');
    const config = basePath ? { apiKey, basePath } : { apiKey };
    this.openai = new OpenAIApi(
      new Configuration(config)
    );
    this.defaultModel = this.configService.get<string>('OPENAI_API_DEFAULT_MODEL') || 'gpt-3.5-turbo';
  }

  private readonly openai: OpenAIApi;
  private readonly defaultModel: string;

  async getEmbedding(chunkedText: string[]): Promise<CreateEmbeddingResponse> {
    try {
      const res = await this.openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: chunkedText,
      });
      return res.data;
    } catch (error) {
      Logger.error(error, 'OpenAI API Error');
      throw { error, host: 'OpenAI' };
    }
  };

  chat(messages: ChatCompletionRequestMessage[], model?: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      this.openai.createChatCompletion({
        model: model || this.defaultModel || 'gpt-3.5-turbo',
        messages: messages,
        stream: true,
      }, { responseType: 'stream' })
        .then((response) => {
          // @ts-ignore
          response.data.on('data', (data: string) => {
            //@ts-ignore
            const lines = data.toString().split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
              const message = line.slice(6);
              if (message === '[DONE]') {
                subscriber.complete();
                return;
              }
              try {
                const msg = JSON.parse(message);
                if (msg.choices[0].delta.content) {
                  subscriber.next({ data: msg.choices[0].delta.content, type: 'message' });
                }
              } catch (error) {
                subscriber.error(error);
                Logger.error(error, 'OpenAI API Error');
              }
            }
          });
        }).catch((error) => {
          subscriber.error('OpenAI API Error');
          Logger.error(error, 'OpenAI API Error');
        });
    });
  }

}
