import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { cfg } from '../configuration';
import { BullShipAgentL2Registrar } from '../constants/BullShipAgentL2Registrar';
import { ReverseRegistrar } from '../constants/ReverseRegistrar';
import { addressList } from 'src/constants/addressList';
import { WalletService } from 'src/agent/wallet/wallet.service';
import { DrizzleAsyncProvider } from 'src/db/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { logTransaction } from 'src/utils/transaction.util';

@Injectable()
export class EnsService {
  private baseSepoliaProvider: ethers.JsonRpcProvider;
  private adminBaseSepoliaSigner: ethers.Wallet;
  private sepoliaProvider: ethers.JsonRpcProvider;
  private adminSepoliaSigner: ethers.Wallet;

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

    this.sepoliaProvider = new ethers.JsonRpcProvider(cfg.sepoliaRpcUrl);
    this.adminSepoliaSigner = new ethers.Wallet(
      cfg.adminWalletPrivateKey,
      this.sepoliaProvider,
    );
  }

  async registerName(
    label: string,
    ownerAddress: string,
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const registrarContract = new ethers.Contract(
        addressList.baseSepolia.bullShipAgentL2Registrar,
        BullShipAgentL2Registrar.abi,
        this.adminBaseSepoliaSigner,
      );
      const tx = (await registrarContract.register(
        label,
        ownerAddress,
      )) as ethers.ContractTransactionResponse;
      logTransaction(
        tx,
        'Base Sepolia',
        `register ENS name ${label}.bullship.eth`,
      );
      await tx.wait();
      return tx;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to register name: ${error.message}`);
      }
      throw new Error('Failed to register name: Unknown error');
    }
  }

  async setPrimaryName(name: string, ownerAddress: string) {
    try {
      await this.registerName(name, ownerAddress);
      name = `${name.toLowerCase()}.bullship.eth`;
      const tx = await this.adminSepoliaSigner.sendTransaction({
        to: ownerAddress,
        value: ethers.parseEther('0.001'),
      });
      logTransaction(tx, 'Sepolia', 'send ETH to owner');
      await tx.wait();
      const ownerEncryptedWalletData =
        await this.db.query.walletKeysTable.findFirst({
          where: eq(schema.walletKeysTable.address, ownerAddress.toLowerCase()),
        });
      if (!ownerEncryptedWalletData) {
        throw new Error('Owner not found');
      }
      const ownerSigner = this.walletService.getSigner(
        ownerEncryptedWalletData.encryptedWalletData,
        this.sepoliaProvider,
      );
      const reverseRegistrarContract = new ethers.Contract(
        addressList.sepolia.reverseRegistrar,
        ReverseRegistrar.abi,
        ownerSigner,
      );
      const tx2 = (await reverseRegistrarContract.setName(
        name,
      )) as ethers.ContractTransactionResponse;
      logTransaction(tx2, 'Sepolia', `set primary name to ${name}`);
      await tx2.wait();
      return tx2;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to set primary name: ${error.message}`);
      }
      throw new Error('Failed to set primary name: Unknown error');
    }
  }
}
