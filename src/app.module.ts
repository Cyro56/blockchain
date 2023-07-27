import { Module } from '@nestjs/common';
import ChainAPIService from './chain-API/chain-service';
import { ChainAPIController } from './chain-API/chain.controller';
import MempoolService from './miner/mempool/mempool.service';
import { MempoolController } from './miner/mempool/mempool.controller';
import { MinerController } from './miner/miner.controller';
import MinerService from './miner/miner.service';
import { TestController } from './test.controller';

@Module({
  imports: [],
  controllers: [
    ChainAPIController,
    MempoolController,
    MinerController,
    TestController,
  ],
  providers: [ChainAPIService, MempoolService, MinerService],
})
export class AppModule {}
