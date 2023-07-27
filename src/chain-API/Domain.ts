import ChainAPIService from './chain-service';
import { blocks, transaction } from './types/entities';
import * as crypto from 'crypto';

export const checkDuplicateBlocks = async (
  block: blocks,
  allBlocks: { blocks: blocks[] },
): Promise<boolean> => {
  const updateBlocks = (
    allBlocks.blocks ? allBlocks.blocks : allBlocks
  ) as blocks[];
  const previousBlockHash = Array.isArray(updateBlocks)
    ? updateBlocks.map((block) => block.header.previousBlockHash)
    : null;

  for (let i = 0; i < updateBlocks.length; i++) {
    if (block.header.previousBlockHash === previousBlockHash[i]) {
      return false;
    }
  }

  return true;
};

export const checkDuplicateChainBlocks = (blockChain: blocks[]) => {
  const previousBlockHash = blockChain.map(
    (block) => block.header.previousBlockHash,
  );

  for (let k = 0; k < previousBlockHash.length; k++) {
    for (let i = 0; i < previousBlockHash.length; i++) {
      if (i != k && previousBlockHash[k] === previousBlockHash[i]) {
        return false;
      }
    }
  }

  return true;
};

export async function checkDuplicateTransactions(
  block: blocks,
): Promise<boolean> {
  const transactionIds = block.transactions.map(
    (transaction) => transaction.id,
  );

  for (let k = 0; k < transactionIds.length; k++) {
    for (let i = 0; i < transactionIds.length; i++) {
      if (i != k && transactionIds[k] === transactionIds[i]) {
        return false;
      }
    }
  }

  return true;
}

export const calculateSHA256Hash = (data: string) => {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
};

export const generateBlockHash = (block: blocks) => {
  const blockString = JSON.stringify(block);
  const firstHash = calculateSHA256Hash(blockString).toString();
  const secondHash = calculateSHA256Hash(firstHash).toString();
  return secondHash;
};

export const verifyBlockHash = async (
  blockHash: string,
  difficultyTarget: number,
): Promise<boolean> => {
  const leadingZeros = (blockHash.match(/^0+/) || [''])[0].length;

  return leadingZeros === difficultyTarget;
};

export const calculateMerkleTree = (transactions: transaction[] | string[]) => {
  const txArr = [...transactions];
  if (txArr.length === 0) {
    return null;
  }

  // Verifica se o número de transações é ímpar e duplica a última transação se necessário
  if (txArr.length % 2 !== 0) {
    // @ts-ignore - TS2322: Type 'string | transaction' is not assignable to type 'transaction'.
    txArr.push(txArr[txArr.length - 1]);
  }

  // Array para armazenar os hashes dos pares de transações
  const merkleTree = [];

  // Calcula o hash SHA-256 para cada transação
  for (let i = 0; i < txArr.length; i += 2) {
    const tx1 = JSON.stringify(txArr[i]);
    const tx2 = JSON.stringify(txArr[i + 1]);
    const combinedHash = calculateSHA256Hash(tx1 + tx2);
    merkleTree.push(combinedHash);
  }

  // Se houver mais de um hash no array, calcula recursivamente até chegar à raiz da árvore
  if (merkleTree.length > 1) {
    return calculateMerkleTree(merkleTree);
  }

  return merkleTree[0]; // Retorna a raiz da árvore
};

export const checkValidMerkleTree = async (block: blocks): Promise<boolean> => {
  const transactions = block.transactions;
  const merkleRoot = block.header.merkleTree;

  // Calcula a Merkle Tree para as transações do bloco

  const calculatedMerkleRoot = calculateMerkleTree(transactions);

  // Verifica se a raiz calculada corresponde à raiz esperada (Merkle Root)
  const isValid = calculatedMerkleRoot === merkleRoot;

  return isValid;
};

function DifficultyTargetRate(difficultyTargetRate: number[]): number {
  if (difficultyTargetRate.length === 0) {
    return 0; // Retorna 0 se a matriz estiver vazia para evitar divisão por zero
  }

  let soma = 0;
  difficultyTargetRate.forEach((valor) => {
    soma += valor;
  });

  const media = soma / difficultyTargetRate.length;
  return media;
}

export const DifficultyTarget = async (lastBlock: blocks): Promise<number> => {
  const currentTimestamp = new Date().getTime();
  const chainAPIService = new ChainAPIService();
  const actualBlocks = await chainAPIService.getData();
  const actualBlocksLength = actualBlocks.blocks.length;
  const initialTimestamp = actualBlocks.blocks[0].header.timestamp;
  const genesisBlockHash = actualBlocks.blocks[0].header.previousBlockHash;
  const previousBlockHash = lastBlock.header.previousBlockHash;
  const previousDifficultyTarget = lastBlock.header.difficultyTarget;
  const difficultyTargetRate = DifficultyTargetRate(
    actualBlocks.blocks.map((block: blocks) => block.header.difficultyTarget),
  );
  const timeRate = Number(
    ((currentTimestamp - initialTimestamp) / actualBlocksLength).toFixed(2),
  );
  const twoMinutes = 1000 * 60 * 2;
  let difficultyTarget = Math.round(
    (previousDifficultyTarget * (twoMinutes / timeRate) +
      difficultyTargetRate) /
      2,
  );

  if (previousBlockHash === genesisBlockHash) {
    difficultyTarget = 6;
  }

  console.log(previousDifficultyTarget, timeRate, twoMinutes);
  console.log('----------------------');

  console.log(' minutes Rate ' + (timeRate / 60000).toFixed(2));
  console.log('-------DifficultyTarget: ' + difficultyTarget);
  return difficultyTarget;
};

function B() {
  return 'response';
}

function Param(param) {
  return { funct: param };
}

Param(B());
