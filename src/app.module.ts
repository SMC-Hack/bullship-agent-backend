import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { AgentModule } from './agent/agent.module';
import { AccessTokenAuthGuard } from './auth/at-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { TokenModule } from './token/token.module';
import { ChainModule } from './chain/chain.module';

@Module({
  imports: [DbModule, AuthModule, AgentModule, TokenModule, ChainModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenAuthGuard,
    },
  ],
})
export class AppModule {}
