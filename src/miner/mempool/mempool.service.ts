import * as fs from 'fs';
import { createTransaction } from './createTransaction';
import { transaction } from 'src/chain-API/types/entities';

class MempoolService {
  private filePath: string;

  constructor() {
    this.filePath = './src/miner/mempool/mempool.json';
  }

  public async getTransactions() {
    try {
      const rawData = fs.readFileSync(this.filePath);
      const data = JSON.parse(rawData.toString());
      return data.mempool;
    } catch (e) {
      return e.message;
    }
  }

  public async setTransaction() {
    const transaction = createTransaction();
    try {
      const rawData = fs.readFileSync(this.filePath);
      const data = JSON.parse(rawData.toString());
      data.mempool.push(transaction);

      fs.writeFileSync(this.filePath, JSON.stringify(data));
      return (
        'Transação criada com sucesso, txHash: ' +
        transaction.id +
        ' quantidade de transações: ' +
        data.mempool.length
      );
    } catch (error) {
      return 'Erro ao enviar a transação:' + error.message;
    }
  }

  public async removeTxsFromMempool(id: string) {
    try {
      const rawData = fs.readFileSync(this.filePath);
      const data = JSON.parse(rawData.toString());

      // Procura a transação com o ID fornecido
      const index = data.mempool.findIndex(
        (transaction: transaction) => transaction.id === id,
      );

      // Remove a transação se encontrada
      if (index !== -1) {
        data.mempool.splice(index, 1);
        fs.writeFileSync(this.filePath, JSON.stringify(data));
        return 'Transação removida com sucesso, txHash: ' + id;
      } else {
        return 'Transação não encontrada com o ID: ' + id;
      }
    } catch (error) {
      return 'Erro ao remover a transação: ' + error.message;
    }
  }
}

export default MempoolService;
