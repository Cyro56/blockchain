import { transaction } from 'src/chain-API/types/entities';
import { v4 as uuidv4 } from 'uuid';

export const createTransaction = (): transaction => {
  const transaction: transaction = {
    id: uuidv4().toString(),
    inputs: [
      {
        transactionOutputId: uuidv4().toString(),
        outputIndex: 0,
        signature: uuidv4().toString(),
      },
    ],
    outputs: [
      { value: Math.random() * 10, address: uuidv4().toString() },
      { value: Math.random() * 10, address: uuidv4().toString() },
    ],
  };

  return transaction;
};
