import { Controller, Get, Req } from '@nestjs/common';
import { generateBlockHash, verifyBlockHash } from './chain-API/Domain';
import { blocks } from './chain-API/types/entities';

@Controller('Test')
export class TestController {
  @Get('TestBlock') //Enviar transações para a mempool
  async Test(@Req() request): Promise<boolean> {
    const block = request.body;

    const blockHash = generateBlockHash(block);
    const isValidBlockHash = verifyBlockHash(blockHash, 1);
    console.log(block);

    console.log('blockHash: ' + blockHash);

    return isValidBlockHash;
  }
}
