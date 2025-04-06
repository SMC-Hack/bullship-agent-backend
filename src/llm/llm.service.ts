import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { cfg } from 'src/configuration';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
} from '@langchain/core/prompts';
import {
  TRADE_PLAN_SYSTEM_PROMPT,
  TRADE_PLAN_USER_MESSAGE,
} from '../agent/constants/prompt-template.const';
import { AgentTradePlan } from 'src/agent/interfaces/trade.interface';
import { InvokeParams } from './interfaces/invoke-params.interface';

@Injectable()
export class LlmService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: cfg.aiModel,
      apiKey: cfg.openaiApiKey,
    });
  }

  async invoke<T, S>(params: InvokeParams, payload: T) {
    const { systemMessage, userMessage, parseOutput } = params;

    let messages: BaseMessagePromptTemplateLike[] = [];
    if (systemMessage) {
      messages.push(['system', systemMessage]);
    }
    if (userMessage) {
      messages.push(['user', userMessage]);
    }

    const promptTemplate = ChatPromptTemplate.fromMessages(messages);

    if (parseOutput) {
      const parser = new JsonOutputParser<S extends Record<string, any> ? S : never>();
      const chain = promptTemplate.pipe(this.model).pipe(parser);
      return await chain.invoke(payload);
    } else {
      const chain = promptTemplate.pipe(this.model);
      return await chain.invoke(payload);
    }
  }

  async createTradePlan(agentId: string, tempStrategyDescription?: string) {
    // const {
    //   strategyDescription,
    //   knowledges,
    //   chainInfo,
    //   tokensSelected,
    //   tokensTradeAmount,
    //   usdcBalance,
    // } = await this._fetchTradeInfo(agentId);

    const strategyDescriptionPrompt = tempStrategyDescription;

    const parser = new JsonOutputParser<AgentTradePlan>();
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', TRADE_PLAN_SYSTEM_PROMPT],
      ['user', TRADE_PLAN_USER_MESSAGE],
    ]);

    const chain = promptTemplate.pipe(this.model).pipe(parser);

    // const result = await chain.invoke({
    //   strategyDescription: strategyDescriptionPrompt,
    //   knowledges: JSON.stringify(knowledges, null, 2),
    //   tokensSelected: JSON.stringify(tokensSelected, null, 2),
    //   tokensTradeAmount: JSON.stringify(tokensTradeAmount, null, 2),
    //   usdcBalance,
    //   chain: chainInfo.name,
    //   chainId: chainInfo.chainId,
    // });
    // return result;
  }
}
