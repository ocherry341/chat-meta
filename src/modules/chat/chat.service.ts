import { Injectable } from '@nestjs/common';
import { ChatCompletionRequestMessage } from 'openai';
import { concatMap, from, map } from 'rxjs';
import { OpenaiApiService } from 'src/common/services/openai-api.service';
import { PineconeMetadata } from 'src/common/types/pinecone-metadata';
import { MetadataService } from '../metadata/metadata.service';
import { ChatDto } from './dto/chat.dto';
import { CHAT_WITH_CONTEXT_PROMPT } from './prompt/chat-with-context-prompt';

@Injectable()
export class ChatService {

  constructor(
    private readonly openaiApiService: OpenaiApiService,
    private readonly metadataService: MetadataService,
  ) { }

  chat(chatDto: ChatDto) {
    const { messages, filter, model } = chatDto;
    messages.unshift({
      role: 'system',
      content: CHAT_WITH_CONTEXT_PROMPT,
    });
    const lastText = messages[messages.length - 1].content;

    return from(this.metadataService.query({ text: lastText }, filter))
      .pipe(
        map(response => {
          const context = response.matches.map(match => (match.metadata as PineconeMetadata).text);
          const contextBlock = context.reduce((acc, str) => acc += ` - ${str}\n`, '\n---------------------\n') + '\n---------------------\n';
          const lastMessage: ChatCompletionRequestMessage = { role: 'user', content: `'context':${contextBlock}\n\'question':${lastText}` };
          return [...messages.slice(0, messages.length - 1), lastMessage];
        }),
        concatMap(messages => this.openaiApiService.chat(messages, model)),
      );
  }
}
