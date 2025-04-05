import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAgentTokenDto {
  @IsNotEmpty()
  @IsString()
  stockAddress: string;
}
