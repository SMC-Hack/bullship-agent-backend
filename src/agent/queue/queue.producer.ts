import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import {
  AGENT_SNAPSHOT_QUEUE,
  AGENT_EXECUTE_QUEUE,
  AGENT_SETTLEMENT_QUEUE,
  AGENT_SNAPSHOT_INTERVAL,
  AGENT_EXECUTE_INTERVAL,
  AGENT_SETTLEMENT_INTERVAL,
} from 'src/constants/queue.constant';

@Injectable()
export class QueueProducer implements OnModuleInit {
  constructor(
    @InjectQueue(AGENT_SNAPSHOT_QUEUE)
    private readonly agentSnapShotQueue: Queue,
    @InjectQueue(AGENT_EXECUTE_QUEUE)
    private readonly agentExecuteQueue: Queue,
    @InjectQueue(AGENT_SETTLEMENT_QUEUE)
    private readonly agentSettlementQueue: Queue,
  ) {}

  onModuleInit() {
    void this.initializeSnapshotJob();
  }

  async initializeSnapshotJob() {
    const jobs = await this.agentSnapShotQueue.getJobSchedulers();
    const job = jobs.find((job) => job.name === AGENT_SNAPSHOT_QUEUE);
    if (!job) {
      await this.agentSnapShotQueue.add(
        AGENT_SNAPSHOT_QUEUE,
        {},
        {
          repeat: {
            every: AGENT_SNAPSHOT_INTERVAL,
          },
        },
      );
    }
  }

  async addAgentExecuteJob(
    agentId: string,
    intervalSeconds: number = AGENT_EXECUTE_INTERVAL,
  ) {
    await this.agentExecuteQueue.add(
      agentId,
      {
        agentId,
      },
      {
        repeat: {
          every: intervalSeconds * 1000,
        },
      },
    );
  }

  async addAgentSettlementJob(
    agentId: string,
    intervalSeconds: number = AGENT_SETTLEMENT_INTERVAL,
  ) {
    await this.agentSettlementQueue.add(
      agentId,
      {
        agentId,
      },
      {
        repeat: {
          every: intervalSeconds * 1000,
        },
      },
    );
  }

  async removeAgentExecuteJob(agentId: string) {
    const jobs = await this.agentExecuteQueue.getJobSchedulers();
    const job = jobs.find((job) => job.name === agentId);
    if (job) {
      await this.agentExecuteQueue.removeJobScheduler(job.key);
    }
  }

  async removeAgentSettlementJob(agentId: string) {
    const jobs = await this.agentSettlementQueue.getJobSchedulers();
    const job = jobs.find((job) => job.name === agentId);
    if (job) {
      await this.agentSettlementQueue.removeJobScheduler(job.key);
    }
  }
}
