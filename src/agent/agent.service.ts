import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import * as schema from 'src/db/schema';
import { CreateAgentP1Dto } from './dto/create-agent-p1.dto';
import { WalletService } from './wallet/wallet.service';
import { eq } from 'drizzle-orm';
import { CreateAgentP2Dto } from './dto/create-agent-p2.dto';

@Injectable()
export class AgentService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly walletService: WalletService,
  ) {}

  async createPhase1(userId: string, createAgentDto: CreateAgentP1Dto) {
    const agent = await this.db.query.agentsTable.findFirst({
      where: eq(schema.agentsTable.name, createAgentDto.name),
    });
    if (agent) {
      throw new BadRequestException('Agent name already exists');
    }

    try {
      const transaction = await this.db.transaction(async (tx) => {
        const agent = await tx
          .insert(schema.agentsTable)
          .values({
            userId: +userId,
            name: createAgentDto.name,
            selectedTokens: createAgentDto.selectedTokens,
            strategy: createAgentDto.strategy,
          } as typeof schema.agentsTable.$inferInsert)
          .returning();

        const newWallet = this.walletService.createWallet();

        await tx.insert(schema.walletKeysTable).values({
          agentId: agent[0].id,
          address: newWallet.address,
          encryptedWalletData: newWallet.encryptedWalletData,
        });
        return { ...agent[0], walletAddress: newWallet.address };
      });
      return transaction;
    } catch (err) {
      console.log(err);
    }
  }

  async createPhase2(createAgentDto: CreateAgentP2Dto, agentId: string) {
    const agent = await this.db.query.agentsTable.findFirst({
      where: eq(schema.agentsTable.id, +agentId),
      with: {
        walletKey: true,
      },
    });

    if (!agent) {
      throw new BadRequestException('Agent not found');
    }

    if (!agent.walletKey?.address) {
      throw new BadRequestException('Agent wallet not found');
    }

    if (agent.stockSymbol || agent.stockAddress) {
      throw new BadRequestException(
        'Agent already has a stock symbol or address',
      );
    }

    //TODO: Set ENS for Agent Wallet

    const transaction = await this.db.transaction(async (tx) => {
      const agent = await tx
        .update(schema.agentsTable)
        .set({
          stockSymbol: createAgentDto.stockSymbol,
          stockAddress: createAgentDto.stockAddress,
        })
        .where(eq(schema.agentsTable.id, +agentId))
        .returning();

      return agent[0];
    });
    return transaction;
  }
}
