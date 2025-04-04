import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { isValidAddress } from '../utils/address.util';
import { LoginDto } from './login.dto';
import { VerifySignatureGuard } from './signature.guard';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('/:walletAddress/generate')
  async getAuthMessage(@Param('walletAddress') walletAddress: string) {
    if (!isValidAddress(walletAddress)) {
      throw new BadRequestException('Invalid wallet address');
    }
    return await this.authService.generateAuthMessage(
      walletAddress.toLowerCase(),
    );
  }

  @Public()
  @Post('/login')
  @UseGuards(VerifySignatureGuard)
  async login(@Body() { walletAddress }: LoginDto) {
    if (!isValidAddress(walletAddress)) {
      throw new BadRequestException('Invalid wallet address');
    }
    return await this.authService.walletLogin(walletAddress.toLowerCase());
  }
}
