import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAgentP2Dto {
  @IsNotEmpty()
  @IsString()
  stockSymbol: string;

  @IsNotEmpty()
  @IsString()
  stockAddress: string;
}
