import { Module } from '@nestjs/common';
import { OneInchService } from './one-inch.service';

@Module({
  providers: [OneInchService],
  exports: [OneInchService],
})
export class OneInchModule {}
