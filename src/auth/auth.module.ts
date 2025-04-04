import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './at-auth.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [AuthService, AccessTokenStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
