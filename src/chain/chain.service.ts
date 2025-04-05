import { Injectable } from '@nestjs/common';
import { cfg } from '../configuration';
import { ChainInfo } from './interfaces/chain-info.interface';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class ChainService {
  async readChainList(): Promise<ChainInfo[]> {
    const filePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'web3',
      'chains',
      'chains.json',
    );
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const chainList = JSON.parse(data);
      return chainList.map((chain: ChainInfo) => ({
        ...chain,
        iconUrl: chain.icon
          ? cfg.chainIconTemplateUrl.replace('{chain_name}', chain.icon)
          : undefined,
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async readMulticallAddress(): Promise<Record<string, string>> {
    const filePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'data',
      'chains',
      'multicall.json',
    );
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }

  async readAmmAddress(): Promise<Record<string, string>> {
    const filePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'data',
      'chains',
      'amm.json',
    );
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }

  async getAvailableChains(): Promise<ChainInfo[]> {
    const chainList = await this.readChainList();
    return chainList.filter((chain: ChainInfo) =>
      cfg.availableChainIds.includes(chain.chainId.toString()),
    );
  }

  async getChainInfo(chainId: number): Promise<ChainInfo | undefined> {
    const chainList = await this.getAvailableChains();
    return chainList.find((chain: ChainInfo) => chain.chainId === chainId);
  }

  async getMulticallAddress(chainId: number): Promise<string> {
    const multicallAddress = await this.readMulticallAddress();
    return multicallAddress[chainId.toString()];
  }

  async getAmmAddress(chainId: number): Promise<string> {
    const ammAddress = await this.readAmmAddress();
    return ammAddress[chainId.toString()];
  }
}
