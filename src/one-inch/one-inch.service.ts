import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { cfg } from '../configuration';
import {
  GetWalletTokenBalancesResponse,
  GetTokenPricesResponse,
  GetPortfolioProfitAndLossResponse,
  GetPortfolioValueChartResponse,
  GetPortfolioCurrentValueResponse,
  GetPortfolioErc20DetailsResponse,
} from './one-inch.interface';

@Injectable()
export class OneInchService {
  private config = {
    headers: {
      Authorization: `Bearer ${cfg.oneInchApiKey}`,
    },
  };

  async getWalletTokenBalances(
    walletAddress: string,
    tokens: string[],
    chain: string,
  ) {
    const response = await axios.post(
      `https://api.1inch.dev/balance/v1.2/${chain}/balances/${walletAddress}`,
      {
        tokens,
      },
      this.config,
    );
    return response.data as GetWalletTokenBalancesResponse;
  }

  async getTokenPrices(chain: string, tokens: string[], currency: string) {
    const response = await axios.post(
      `https://api.1inch.dev/price/v1.1/${chain}`,
      {
        tokens,
        currency,
      },
      this.config,
    );
    return response.data as GetTokenPricesResponse;
  }

  async getPortfolioProfitAndLoss(
    walletAddress: string[],
    chainId: string,
    timeRange: string,
  ) {
    const response = await axios.get(
      'https://api.1inch.dev/portfolio/portfolio/v4/general/profit_and_loss',
      {
        ...this.config,
        params: {
          chain_id: chainId,
          timerange: timeRange,
          addresses: walletAddress,
        },
        paramsSerializer: {
          indexes: null,
        },
      },
    );
    return response.data as GetPortfolioProfitAndLossResponse;
  }

  async getPortfolioValueChart(
    walletAddress: string[],
    chainId: string,
    timeRange: string,
  ) {
    const response = await axios.get(
      'https://api.1inch.dev/portfolio/portfolio/v4/general/value_chart',
      {
        ...this.config,
        params: {
          chain_id: chainId,
          timerange: timeRange,
          addresses: walletAddress,
        },
        paramsSerializer: {
          indexes: null,
        },
      },
    );
    return response.data as GetPortfolioValueChartResponse;
  }

  async getPortfolioCurrentValue(walletAddress: string[], chainId: string) {
    const response = await axios.get(
      'https://api.1inch.dev/portfolio/portfolio/v4/general/current_value',
      {
        ...this.config,
        params: {
          chain_id: chainId,
          addresses: walletAddress,
        },
        paramsSerializer: {
          indexes: null,
        },
      },
    );
    return response.data as GetPortfolioCurrentValueResponse;
  }

  async getPortfolioErc20Details(
    walletAddress: string[],
    chainId: string,
    timeRange: string,
    closed: boolean = true,
    closedThreshold: number = 1,
  ) {
    const response = await axios.get(
      'https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/details',
      {
        ...this.config,
        params: {
          chain_id: chainId,
          addresses: walletAddress,
          timerange: timeRange,
          closed,
          closed_threshold: closedThreshold,
        },
        paramsSerializer: {
          indexes: null,
        },
      },
    );
    return response.data as GetPortfolioErc20DetailsResponse;
  }
}
