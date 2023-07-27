import { Controller, Post, Get } from '@nestjs/common';
import MempoolService from './mempool.service';
import { transaction } from 'src/chain-API/types/entities';

@Controller('mempool')
export class MempoolController {
  constructor(private mempoolService: MempoolService) {}

  @Post('createTxs') //Enviar transações para a mempool
  async SendTxs(): Promise<string> {
    return await this.mempoolService.setTransaction();
  }

  @Get('getTxs') //Enviar transações para a mempool
  async getTxs(): Promise<transaction[]> {
    return await this.mempoolService.getTransactions();
  }
}
