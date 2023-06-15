import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";

export class ChatDto {

  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  @IsNotEmpty()
  readonly messages: ChatMessageDto[];

  @IsOptional()
  @IsObject()
  filter?: Object;

  @IsOptional()
  @IsString()
  model?: string;

}

class ChatMessageDto {

  @IsEnum(['system', 'user', 'assistant'])
  readonly role: 'system' | 'user' | 'assistant';

  @IsString()
  readonly content: string;

  @IsOptional()
  @IsString()
  readonly name?: string;

}