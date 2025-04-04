import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { AgentModule } from './agent/agent.module';
import { AccessTokenAuthGuard } from './auth/at-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [DbModule, AuthModule, AgentModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenAuthGuard,
    },
  ],
})
export class AppModule {}
