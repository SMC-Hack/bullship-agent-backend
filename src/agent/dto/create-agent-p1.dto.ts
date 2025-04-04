import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAgentP1Dto {
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
