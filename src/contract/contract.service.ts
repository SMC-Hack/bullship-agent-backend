import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ethers } from 'ethers';
import { WalletService } from 'src/agent/wallet/wallet.service';
import { cfg } from 'src/configuration';
import { addressList } from 'src/constants/addressList';
import { erc20 } from 'src/constants/erc20';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import * as schema from 'src/db/schema';
import { logTransaction } from 'src/utils/transaction.util';

@Injectable()
export class ContractService {
  private baseSepoliaProvider: ethers.JsonRpcProvider;
  private adminBaseSepoliaSigner: ethers.Signer;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
  ) {
    this.baseSepoliaProvider = new ethers.JsonRpcProvider(
      cfg.baseSepoliaRpcUrl,
    );
    this.adminBaseSepoliaSigner = new ethers.Wallet(
      cfg.adminWalletPrivateKey,
      this.baseSepoliaProvider,
    );
  }

  async agentApproveMaxToAgentMerchant(walletAddress: string) {
    try {
      const tx0 = await this.adminBaseSepoliaSigner.sendTransaction({
        to: walletAddress,
        value: ethers.parseEther('0.001'),
      });
      logTransaction(tx0, 'Base Sepolia', 'send ETH to agent');
      await tx0.wait();
      const agentEncryptedWalletData =
        await this.db.query.walletKeysTable.findFirst({
          where: eq(schema.walletKeysTable.address, walletAddress),
        });
      if (!agentEncryptedWalletData) {
        throw new Error('Agent wallet not found');
      }
      const agentSigner = this.walletService.getSigner(
        agentEncryptedWalletData.encryptedWalletData,
        this.baseSepoliaProvider,
      );
      const usdcContract = new ethers.Contract(
        addressList.baseSepolia.usdc,
        erc20.abi,
        agentSigner,
      );
      const tx = (await usdcContract.approve(
        addressList.baseSepolia.agentMerchant,
        ethers.MaxUint256,
      )) as ethers.ContractTransactionResponse;
      logTransaction(tx, 'Base Sepolia', 'approve USDC to AgentMerchant');
      return tx;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
