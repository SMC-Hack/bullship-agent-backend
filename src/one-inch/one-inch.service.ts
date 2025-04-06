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
import { sleep } from 'src/utils/time.utils';

import {
  SDK,
  HashLock,
  SupportedChain,
  PresetEnum,
  OrderStatus,
} from '@1inch/cross-chain-sdk';
import { Web3Like } from '@1inch/fusion-sdk';
import { randomBytes } from 'node:crypto';

import { ethers } from 'ethers';
import Web3 from 'web3';
import { ERC20_ABI } from 'src/common/modules/ethereum/abis/erc20.abi';

@Injectable()
export class OneInchService {
  private config = {
    headers: {
      Authorization: `Bearer ${cfg.oneInchApiKey}`,
    },
  };
  private web3: Web3Like;
  private sdk: SDK;

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

  async getEscrowAddress(chainId: SupportedChain) {
    // const url = `https://api.1inch.dev/fusion-plus/orders/v1.0/order/escrow?chainId=${chainId}`;
    // const requestConfig = {
    //   headers: {
    //     Authorization: `Bearer ${config.ONEINCH_API_KEY}`,
    //   },
    // };
    // const result = await axios.get<{address: string}>(url, requestConfig);
    // return result.data.address;
    return "0x111111125421ca6dc452d289314280a0f8842a65" // Aggregattion router v6
  }

  async placeCrossChainOrder(
    srcChainId: SupportedChain,
    dstChainId: SupportedChain,
    srcTokenAddress: string,
    dstTokenAddress: string,
    amount: string,
    rpcUrl: string,
    privateKey: string,
  ) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const erc20Contract = new ethers.Contract(srcTokenAddress, ERC20_ABI, wallet);
    const routerAddress = await this.getEscrowAddress(srcChainId);
    const allowance = await erc20Contract.allowance(wallet.address, routerAddress);

    if (BigInt(allowance) < BigInt(amount)) {
      console.log('approve');
      const tx = await erc20Contract.approve(routerAddress, ethers.MaxUint256);
      await tx.wait();
      console.log('approve success: ', tx.hash);
    }

    await sleep(1000);

    const params = {
      srcChainId,
      dstChainId,
      srcTokenAddress,
      dstTokenAddress,
      amount,
      enableEstimate: true,
      walletAddress: wallet.address,
    };

    const quote = await this.sdk.getQuote(params);
    const source = 'sdk';
    const preset = PresetEnum.fast;

    const secrets = Array.from({
      length: quote.presets[preset].secretsCount,
    }).map(() => '0x' + randomBytes(32).toString('hex'));

    const hashLock =
      secrets.length === 1
        ? HashLock.forSingleFill(secrets[0])
        : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));

    const secretHashes = secrets.map((s) => HashLock.hashSecret(s));

    await sleep(1000);

    const { hash, quoteId, order } = await this.sdk.createOrder(quote, {
      walletAddress: wallet.address,
      hashLock,
      preset,
      source,
      secretHashes,
    });
    console.log({ hash }, 'order created');

    await sleep(1000);

    await this.sdk
      .submitOrder(quote.srcChainId, order, quoteId, secretHashes)
      .catch((err) => {
        console.log('err.response.data: ', err.response.data);
        throw new Error(err);
      });
    console.log({ hash }, 'order submitted');

    await sleep(1000);

    // submit secrets for deployed escrows
    while (true) {
      const secretsToShare = await this.sdk.getReadyToAcceptSecretFills(hash);
      console.log('secretsToShare: ', secretsToShare);

      await sleep(1000);

      if (secretsToShare.fills.length) {
        for (const { idx } of secretsToShare.fills) {
          await this.sdk.submitSecret(hash, secrets[idx]);

          await sleep(1000);

          console.log({ idx }, 'shared secret');
        }
      }

      // check if order finished
      const { status } = await this.sdk.getOrderStatus(hash);
      console.log('status: ', status);

      if (
        status === OrderStatus.Executed ||
        status === OrderStatus.Expired ||
        status === OrderStatus.Refunded
      ) {
        break;
      }

      await sleep(1000);
    }

    await sleep(1000);
    const statusResponse = await this.sdk.getOrderStatus(hash);
    console.log('statusResponse: ', statusResponse);

    return 'Success: Please check the log';
  }
}
