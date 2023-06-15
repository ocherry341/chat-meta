import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class QueryDto {

  @IsNotEmpty()
  @IsString()
  readonly text: string;

  @IsOptional()
  @IsNumber()
  readonly topK?: number;

  @IsOptional()
  @IsObject()
  readonly filter?: Object;
}