import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAgentTokenDto {
  @IsNotEmpty()
  @IsString()
  stockSymbol: string;

  @IsNotEmpty()
  @IsString()
  stockAddress: string;
}
