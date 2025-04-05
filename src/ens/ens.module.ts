import { Module } from '@nestjs/common';
import { EnsService } from './ens.service';
import { WalletModule } from 'src/agent/wallet/wallet..module';

@Module({
  imports: [WalletModule],
  providers: [EnsService],
  exports: [EnsService],
})
export class EnsModule {}
