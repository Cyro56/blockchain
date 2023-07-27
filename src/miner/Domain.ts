import {
  DifficultyTarget,
  calculateMerkleTree,
  generateBlockHash,
} from 'src/chain-API/Domain';
import ChainAPIService from 'src/chain-API/chain-service';
import { transaction } from 'src/chain-API/types/entities';

export const createTxBlock = async (txs: transaction[], version: number) => {
  const chainService = new ChainAPIService();
  const chainData = await chainService.getData();
  const lastBlock = chainData.blocks[chainData.blocks.length - 1];
  const PreviousBlockHash = generateBlockHash(lastBlock);
  const currentTimestamp = new Date().getTime();
  const currentDifficultyTarget = await DifficultyTarget(lastBlock);
  const actualMerkleTree = calculateMerkleTree(txs);

  const block = {
    header: {
      version: version,
      previousBlockHash: PreviousBlockHash,
      timestamp: currentTimestamp,
      difficultyTarget: currentDifficultyTarget,
      merkleTree: actualMerkleTree,
      nonce: 0,
    },
    transactions: txs,
  };

  return block;
};
