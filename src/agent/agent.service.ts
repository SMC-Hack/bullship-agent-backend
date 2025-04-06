import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import * as schema from 'src/db/schema';
import { WalletService } from './wallet/wallet.service';
import { asc, desc, eq, like } from 'drizzle-orm';
import { CreateAgentTokenDto } from './dto/create-agent-token.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { CommonQuery } from 'src/common/query/pagination-query';
import { EnsService } from 'src/ens/ens.service';
import { ContractService } from 'src/contract/contract.service';
import { OneInchService } from 'src/one-inch/one-inch.service';
import { LlmService } from 'src/llm/llm.service';
import { AgentTradePlan, TradePlan } from './interfaces/trade.interface';
import { TRADE_PLAN_SYSTEM_PROMPT, TRADE_PLAN_USER_MESSAGE } from './constants/prompt-template.const';
import { InvokeParams } from 'src/llm/interfaces/invoke-params.interface';

@Injectable()
export class AgentService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly walletService: WalletService,
    private readonly ensService: EnsService,
    private readonly contractService: ContractService,
    private readonly oneInchService: OneInchService,
    private readonly llmService: LlmService,
  ) {}

  async getAgents(commonQuery: CommonQuery) {
    const { page = 1, limit = 10, search, sortBy, sortDirection } = commonQuery;

    const orderDirFn = sortDirection === 'asc' ? asc : desc;
    let orderByField: (typeof schema.agentsTable)[keyof typeof schema.agentsTable] =
      schema.agentsTable.createdAt;

    switch (sortBy) {
      case 'name':
        orderByField = schema.agentsTable.name;
        break;
      case 'createdAt':
        orderByField = schema.agentsTable.createdAt;
        break;
    }
    const query = await this.db.query.agentsTable.findMany({
      offset: (page - 1) * limit,
      limit,
      where: search ? like(schema.agentsTable.name, `%${search}%`) : undefined,
      orderBy: [orderDirFn(orderByField)],
      with: {
        balanceSnapshots: true,
        user: {
          columns: {
            walletAddress: true,
          },
        },
        walletKey: {
          columns: {
            address: true,
          },
        },
      },
    });

    const agentsWithPortfolio = await Promise.all(
      query.map(async (agent) => {
        if (agent.walletKey?.address) {
          const week = await this.oneInchService.getPortfolioValueChart(
            [agent.walletKey?.address],
            '8453',
            '1week',
          );
          return { ...agent, week };
        }
        return agent;
      }),
    );

    return agentsWithPortfolio;
  }

  async getAgent(agentId: string) {
    const agent = await this.db.query.agentsTable.findFirst({
      where: eq(schema.agentsTable.id, +agentId),
      with: {
        balanceSnapshots: true,
        user: {
          columns: {
            walletAddress: true,
          },
        },
        walletKey: {
          columns: {
            address: true,
          },
        },
      },
    });
    if (agent && agent.walletKey?.address) {
      const week = await this.oneInchService.getPortfolioValueChart(
        [agent.walletKey?.address],
        '8453',
        '1week',
      );
      const month = await this.oneInchService.getPortfolioValueChart(
        [agent.walletKey?.address],
        '8453',
        '1month',
      );
      const year = await this.oneInchService.getPortfolioValueChart(
        [agent.walletKey?.address],
        '8453',
        '1year',
      );
      return { ...agent, week, month, year };
    } else {
      return agent;
    }
  }

  async updateENSandApproveMerchant(name: string, walletAddress: string) {
    await this.ensService.setPrimaryName(name, walletAddress);
    void this.contractService.agentApproveMaxToAgentMerchant(walletAddress);
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
            description: createAgentDto.description,
            imageUrl: createAgentDto.imageUrl,
            stockSymbol: createAgentDto.stockSymbol,
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

      void this.updateENSandApproveMerchant(
        createAgentDto.name,
        transaction.walletAddress,
      );

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

    if (agent.stockAddress) {
      throw new BadRequestException('Agent already has a stock address');
    }

    const transaction = await this.db.transaction(async (tx) => {
      const agent = await tx
        .update(schema.agentsTable)
        .set({
          stockAddress: createAgentDto.stockAddress,
        })
        .where(eq(schema.agentsTable.id, +agentId))
        .returning();

      return agent[0];
    });
    return transaction;
  }

  async generateTradePlan(agentId: string) {
    const agent = await this.db.query.agentsTable.findFirst({
      where: eq(schema.agentsTable.id, +agentId),
    });

    if (!agent) {
      throw new BadRequestException('Agent not found');
    }

    const params: InvokeParams = {
      systemMessage: TRADE_PLAN_SYSTEM_PROMPT,
      userMessage: TRADE_PLAN_USER_MESSAGE,
      parseOutput: true,
    };

    const payload: {
      strategy: string;
      tokens: string;
    } = {
      strategy: agent.strategy,
      tokens: agent.selectedTokens,
    };

    const tradePlan = await this.llmService.invoke<{ strategy: string; tokens: string }, AgentTradePlan>(params, payload);

    return tradePlan;
  }
}
