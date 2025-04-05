import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import { TokenInfo, TokenInfoMap } from './interfaces/token-info.interface';
import { cfg } from 'src/configuration';

@Injectable()
export class TokenService {
  async readTokenList(chainId: number | string): Promise<TokenInfoMap> {
    const filePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'web3',
      'tokens',
      `${chainId.toString()}.json`,
    );
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }

  async getAvailableTokens(
    chainId: number | string
  ): Promise<TokenInfo[]> {
    const isChainAvailable = cfg.availableChainIds.includes(
      chainId.toString(),
    );
    if (!isChainAvailable) {
      throw new Error(`Chain ${chainId} is not available`);
    }

    const tokenList = await this.readTokenList(chainId);
    return Object.values(tokenList);
  }

  async getAvailableTokenMap(chainId: number | string): Promise<TokenInfoMap> {
    const tokens = await this.getAvailableTokens(chainId);
    const tokenAddressMap = Object.fromEntries(
      tokens.map((token) => [token.address.toLowerCase(), token]),
    );
    const tokenSymbolMap = Object.fromEntries(
      tokens.map((token) => [token.symbol.toLowerCase(), token]),
    );
    return {
      ...tokenAddressMap,
      ...tokenSymbolMap,
    };
  }
  
}
