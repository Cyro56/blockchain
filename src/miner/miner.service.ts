import MempoolService from './mempool/mempool.service';
import { createTxBlock } from './Domain';
import { generateBlockHash, verifyBlockHash } from 'src/chain-API/Domain';
import ChainAPIService from 'src/chain-API/chain-service';

class MinerService {
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  public async minerTxs() {
    const mempoolService = new MempoolService();
    const chainService = new ChainAPIService();
    let txs = await mempoolService.getTransactions();

    while (txs.length > 0) {
      const orderedTxs = txs.reverse();
      const txsToMine = orderedTxs.slice(0, 2);
      const blockToMine = await createTxBlock(txsToMine, 1);

      let nonce = 0;

      let blockHash = '';
      const difficultyTarget = blockToMine.header.difficultyTarget;
      let isValidBlockHash = await verifyBlockHash(blockHash, difficultyTarget);
      console.log('Mining block...', !isValidBlockHash);

      while (!isValidBlockHash) {
        nonce++;
        blockToMine.header.nonce = nonce;

        blockHash = generateBlockHash(blockToMine);

        isValidBlockHash = await verifyBlockHash(blockHash, difficultyTarget);
      }

      console.log('Find block hash: ' + blockHash + ' with nonce: ' + nonce);

      chainService.sendBlock(blockToMine); //enviando bloco para a rede
      for (let i = 0; i < blockToMine.transactions.length; i++) {
        mempoolService.removeTxsFromMempool(blockToMine.transactions[i].id);
        await this.delay(400);
      }
      txs = await mempoolService.getTransactions(); //atualizando as transações disponíveis no mempool
    }

    return 'Miner finished';
  }
}

export default MinerService;
