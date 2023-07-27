import { Controller, Post } from '@nestjs/common';
import MinerService from './miner.service';

@Controller('miner')
export class MinerController {
  constructor(private minerService: MinerService) {}
  @Post('run') //Enviar transações para a mempool
  async SendNode(): Promise<string> {
    return await this.minerService.minerTxs();
  }
}
