import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import * as schema from 'src/db/schema';
import { WalletService } from './wallet/wallet.service';
import { asc, desc, eq, like } from 'drizzle-orm';
import {  CreateAgentTokenDto } from './dto/create-agent-token.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { CommonQuery } from 'src/common/query/pagination-query';

@Injectable()
export class AgentService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly walletService: WalletService,
  ) {}

  async getAgents(commonQuery: CommonQuery) {
    const { page = 1, limit = 10, search, sortBy, sortDirection } = commonQuery;

    const orderDirFn = sortDirection === 'asc' ? asc : desc;
    let orderByField: typeof schema.agentsTable[keyof typeof schema.agentsTable] = schema.agentsTable.createdAt;

    switch (sortBy) {
      case 'name':
        orderByField = schema.agentsTable.name;
        break;
      case 'createdAt':
        orderByField = schema.agentsTable.createdAt;
        break;
    }
    return this.db.query.agentsTable.findMany({
      offset: (page - 1) * limit,
      limit,
      where: search ? like(schema.agentsTable.name, `%${search}%`) : undefined,
      orderBy: [orderDirFn(orderByField)]
    });
  }

  async getAgent(agentId: string) {
    return this.db.query.agentsTable.findFirst({
      where: eq(schema.agentsTable.id, +agentId),
    });
  }

  async createAgent(userId: string, createAgentDto: CreateAgentDto) {
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

  async createAgentToken(createAgentDto: CreateAgentTokenDto, agentId: string) {
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
