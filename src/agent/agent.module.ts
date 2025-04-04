import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { WalletModule } from './wallet/wallet..module';

@Module({
  providers: [AgentService],
  controllers: [AgentController],
  imports: [WalletModule],
})
export class AgentModule {}
