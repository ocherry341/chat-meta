import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPort, IsString, IsUrl, validateSync } from 'class-validator';


class EnvironmentVariables {

  @IsNotEmpty()
  OPENAI_API_KEY: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['https', 'http'] })
  OPENAI_API_BASE_URL: string;

  @IsNotEmpty()
  PINECONE_API_KEY: string;

  @IsNotEmpty()
  PINECONE_ENVIRONMENT: string;

  @IsNotEmpty()
  PINECONE_INDEX: string;

  @IsOptional()
  @IsNotEmpty()
  PIENCONE_NAMESPACE: string;

  @IsOptional()
  @IsPort()
  PORT: string;

  @IsOptional()
  @IsString()
  OPENAI_API_DEFAULT_MODEL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (errors.length > 0) {
    Logger.error(errors.toString(), 'EnvironmentVariables');
    throw new Error(errors.toString());
  }
  return validatedConfig;
}