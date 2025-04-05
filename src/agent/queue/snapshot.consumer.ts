import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AGENT_SNAPSHOT_QUEUE } from 'src/constants/queue.constant';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/db/schema';
import { Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import { OneInchService } from 'src/one-inch/one-inch.service';
import { eq } from 'drizzle-orm';

@Processor(AGENT_SNAPSHOT_QUEUE)
export class AgentSnapshotConsumer extends WorkerHost {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly oneInchService: OneInchService,
  ) {
    super();
  }

  async process() {
    const agents = await this.db
      .select()
      .from(schema.agentsTable)
      .leftJoin(
        schema.walletKeysTable,
        eq(schema.agentsTable.id, schema.walletKeysTable.agentId),
      );

    for (const agent of agents) {
      try {
        if (agent.wallet_keys?.address) {
          const currentValue =
            await this.oneInchService.getPortfolioCurrentValue(
              [agent.wallet_keys?.address],
              '8453',
            );
          const pnl = await this.oneInchService.getPortfolioProfitAndLoss(
            [agent.wallet_keys?.address],
            '8453',
            '1week',
          );

          await this.db
            .insert(schema.balanceSnapshotsTable)
            .values({
              agentId: agent.agents.id,
              balanceUSD: currentValue.result[0].value_usd,
              pnl: pnl.result[0].abs_profit_usd,
            })
            .onConflictDoUpdate({
              target: schema.balanceSnapshotsTable.agentId,
              set: {
                balanceUSD: currentValue.result[0].value_usd,
                pnl: pnl.result[0].abs_profit_usd,
                createdAt: new Date(),
              },
            });
        }
        console.log(`Agent ${agent.agents.id} balance snapshot recorded`);
      } catch (error) {
        console.log(`Agent ${agent.agents.id} balance snapshot failed`);
        console.error(error);
      }
    }
  }
}
