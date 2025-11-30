export interface BlockchainParams {
  sequence: number;
  ledgerIndex: number;
  fee: string;
}

export const parseBlockchainParams = (text: string): BlockchainParams | null => {
  try {
    // Expected format: "SEQ: 123 | LEDGER: 500000 | FEE: 10"
    const seqMatch = text.match(/SEQ:\s*(\d+)/);
    const ledgerMatch = text.match(/LEDGER:\s*(\d+)/);
    const feeMatch = text.match(/FEE:\s*(\d+)/);

    if (seqMatch && ledgerMatch && feeMatch) {
      return {
        sequence: parseInt(seqMatch[1], 10),
        ledgerIndex: parseInt(ledgerMatch[1], 10),
        fee: feeMatch[1],
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

