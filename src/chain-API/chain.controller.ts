import { Controller, Get, Post, Req } from '@nestjs/common';
import ChainAPIService from '../chain-API/chain-service';
import {
  RequestBlocks,
  RequestBlocksData,
  RequestNodes,
  blocks,
} from '../chain-API/types/entities';

@Controller('ChainAPI')
export class ChainAPIController {
  constructor(private chainService: ChainAPIService) {}

  @Post('SendNode') //Conectar com nós da rede
  async SendNode(@Req() request: RequestNodes): Promise<string> {
    return await this.chainService.sendNode(request.body);
  }

  @Post('SendBlock') //Enviar blocos para meu registro E propagar pra rede
  async SendBlock(
    @Req() request: RequestBlocks & RequestBlocksData,
  ): Promise<string> {
    return await this.chainService.sendBlock(
      request.body.data ? request.body.data : request.body,
    );
  }

  @Get('updateBlocks') //Atualizar blocos
  async updateBlocks(): Promise<string> {
    return await this.chainService.updateBlocks();
  }

  @Get('GetBlocks') //Informar á rede meus blocos atuais
  async GetBlocks(): Promise<blocks> {
    return await this.chainService.getData();
  }
}
