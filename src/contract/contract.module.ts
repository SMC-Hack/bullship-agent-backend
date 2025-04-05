import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { WalletModule } from 'src/agent/wallet/wallet..module';

@Module({
  imports: [WalletModule],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
