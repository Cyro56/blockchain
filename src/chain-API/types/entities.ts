export interface INodes {
  nodeId: string;
  url: string;
}

export interface output {
  value: number;
  address: string;
}

export interface transaction {
  id: string;
  inputs: [
    {
      transactionOutputId: string;
      outputIndex: number;
      signature: string;
    },
  ];
  outputs: output[];
}

export interface blocks {
  header: {
    version: number;
    previousBlockHash: string;
    timestamp: number;
    difficultyTarget: number;
    merkleTree: string;
    nonce: number;
  };
  transactions: transaction[];
}

export interface RequestNodes {
  body: INodes;
}

export interface RequestUpdateBlocks {
  body: { blocks: blocks[] };
}
export interface RequestBlocks {
  body: blocks;
}
export interface RequestBlocksData {
  body: { data: blocks };
}
