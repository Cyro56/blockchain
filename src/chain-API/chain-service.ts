import * as fs from 'fs';
import axios from 'axios';
import { blocks, INodes } from './types/entities';
import {
  checkDuplicateBlocks,
  checkDuplicateChainBlocks,
  checkDuplicateTransactions,
  checkValidMerkleTree,
  generateBlockHash,
  verifyBlockHash,
} from './Domain';

class ChainAPIService {
  private filePath: string;
  private nodePath: string;

  constructor() {
    this.filePath = './src/dataBaseJson/data.json';
    this.nodePath = './src/dataBaseJson/nodes.json';
  }

  public async getData() {
    try {
      const rawData = fs.readFileSync(this.filePath);
      return JSON.parse(rawData.toString());
    } catch (error) {
      console.error('Erro ao ler o arquivo JSON:', error);
      return null;
    }
  }
  public async getNodes() {
    try {
      const rawData = fs.readFileSync(this.nodePath);

      return JSON.parse(rawData.toString());
    } catch (error) {
      console.error('Erro ao ler o arquivo JSON:', error);
      return null;
    }
  }

  public async sendBlock(data: blocks) {
    const actualBlocks = await this.getData();
    const Block = data;

    const verification = await Promise.all([
      checkDuplicateTransactions(Block),
      verifyBlockHash(generateBlockHash(Block), Block.header.difficultyTarget),
      checkDuplicateBlocks(Block, actualBlocks),
      checkValidMerkleTree(data),
    ]);

    const CheckDuplicateTransactions = verification[0];
    const isValidBlockHash = verification[1];
    const checkRepeatedBlock = verification[2];
    const isValidMerkleTree = verification[3];

    const hasTransactions = Block.transactions.length > 0;

    if (!CheckDuplicateTransactions) {
      return 'O bloco contém transações duplicadas.';
    } else if (!hasTransactions) {
      return 'O Bloco não contém transações Suficientes.';
    } else if (!isValidBlockHash) {
      return 'O bloco não é válido.';
    } else if (!checkRepeatedBlock) {
      return 'O bloco já existe.';
    } else if (!isValidMerkleTree) {
      return 'A árvore de Merkle não é válida.';
    } else {
      try {
        actualBlocks.blocks.push(data);
        const jsonData = JSON.stringify(actualBlocks);

        fs.writeFileSync(this.filePath, jsonData);
        const actualNodes = await this.getNodes();

        for (let i = 0; i < actualNodes.nodes.length; i++) {
          try {
            const node = actualNodes.nodes[i];
            const sendBlockToNetwork = await axios.post(
              `${node.url}/ChainAPI/SendBlock`,
              Block,
            );
            console.log(sendBlockToNetwork.data);
          } catch (error) {
            console.log(
              'Erro ao enviar os blocos para este node: ' + error.message,
            );
          }
          if (i < actualNodes.nodes.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        }
        return 'Blocos gravados e Propagados com sucesso.';
      } catch (error) {
        console.error('Erro ao gravar os dados no arquivo JSON:', error);
      }
    }
  }

  public async sendNode(node: INodes) {
    try {
      const actualData = await this.getNodes();
      const response = await axios.get(`${node.url}/ChainAPI/GetBlocks`);
      const data = response.data;
      if (data.blocks !== undefined) {
        actualData.nodes.push(node);
        const jsonData = JSON.stringify(actualData);

        fs.writeFileSync(this.nodePath, jsonData);
        return 'Novo node adcionado com sucesso.';
      } else {
        return 'O node não está funcionando.';
      }
    } catch (error) {
      return 'Erro ao gravar os dados no arquivo JSON: ' + error.message;
    }
  }

  public async updateBlocks() {
    try {
      const nodes = await this.getNodes();

      const Urls = nodes.nodes.map((node: INodes) => node.url);

      const nodeUrl = Urls[Math.floor(Math.random() * Urls.length)];
      const response = await axios.get(`${nodeUrl}/ChainAPI/GetBlocks`);
      const updatedBlocks = response.data.blocks;

      const checkRepeatedBlock = checkDuplicateChainBlocks(updatedBlocks);

      const updateBlockPromises = updatedBlocks.map(async (block: blocks) => {
        //DifficultyTarget é uma função que retorna o valor do DifficultyTarget do bloco, caso ele não exista
        const actualDifficultyTarget = block.header.difficultyTarget;

        const verification = await Promise.all([
          verifyBlockHash(generateBlockHash(block), actualDifficultyTarget),
          checkValidMerkleTree(block),
          checkDuplicateTransactions(block),
        ]);

        const isAllValidBlockHash = verification[0];
        const isAllValidMerkleTree = verification[1];
        const CheckDuplicateTransactions = verification[2];

        const isValidBlock = Boolean(
          CheckDuplicateTransactions &&
            isAllValidBlockHash &&
            checkRepeatedBlock &&
            isAllValidMerkleTree,
        );

        if (!isValidBlock) {
          console.log('O bloco não é válido'); //devido á otimização esse feedBack só será visto no terminal, e não no Postman
          return 'O bloco não é válido';
        }

        const result = await this.sendBlock(block);
        console.log(result);
      });

      await Promise.all(updateBlockPromises);

      return 'Block update';
    } catch (error) {
      console.log(error);
      return 'Block update failed';
    }
  }
}

export default ChainAPIService;
