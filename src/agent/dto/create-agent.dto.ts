import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAgentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  strategy: string;

  @IsNotEmpty()
  @IsString()
  selectedTokens: string;
}
