import { forwardRef, Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { WalletModule } from './wallet/wallet..module';
import { EnsModule } from 'src/ens/ens.module';
import { ContractModule } from 'src/contract/contract.module';
import {
  AGENT_EXECUTE_QUEUE,
  AGENT_SETTLEMENT_QUEUE,
  AGENT_SNAPSHOT_QUEUE,
} from 'src/constants/queue.constant';
import { BullModule } from '@nestjs/bullmq';
import { QueueProducer } from './queue/queue.producer';
import { cfg } from 'src/configuration';
import { AgentSnapshotConsumer } from './queue/snapshot.consumer';
import { OneInchModule } from 'src/one-inch/one-inch.module';
import { LlmModule } from 'src/llm/llm.module';

@Module({
  providers: [
    AgentService,
    QueueProducer,
    ...(cfg.enableQueue ? [AgentSnapshotConsumer] : []),
  ],
  controllers: [AgentController],
  imports: [
    forwardRef(() => WalletModule),
    EnsModule,
    ContractModule,
    OneInchModule,
    BullModule.registerQueue({
      name: AGENT_SNAPSHOT_QUEUE,
    }),
    BullModule.registerQueue({
      name: AGENT_EXECUTE_QUEUE,
    }),
    BullModule.registerQueue({
      name: AGENT_SETTLEMENT_QUEUE,
    }),
    LlmModule,
  ],
})
export class AgentModule {}
