import { Body, Controller, Post, Sse, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';

@UseGuards(AuthGuard)
@Controller()
export class ChatController {

  constructor(
    private readonly chatService: ChatService,
  ) { }

  @Post('chat')
  @Sse()
  chat(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: ChatDto) {
    return this.chatService.chat(body);
  }
}
