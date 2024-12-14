import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
  if (typeof address !== 'string') {
    return res.status(400).json({ error: 'Invalid address parameter' });
  }

  try {
    const connection = new Connection(process.env.SOLANA_RPC_ENDPOINT!);
    const tokenMint = new PublicKey(process.env.TOKEN_MINT_ADDRESS!);

    const tokenAccounts = await connection.getParsedProgramAccounts(
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), 
      {
        filters: [
          { dataSize: 165 }, 
          { memcmp: { offset: 0, bytes: tokenMint.toBase58() } }
        ]
      }
    );

    const holders = tokenAccounts.map((account) => account.account.data.parsed.info.owner);
    const uniqueHolders = new Set(holders);

    // Check if requested address is in the set of holders
    const isHolder = uniqueHolders.has(address);
    res.status(200).json({ isHolder });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
