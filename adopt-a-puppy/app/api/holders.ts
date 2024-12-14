import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_ENDPOINT!);
    const tokenMint = new PublicKey(process.env.TOKEN_MINT_ADDRESS!);

    // Fetch all token accounts for the given mint
    const tokenAccounts = await connection.getParsedProgramAccounts(
      new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), 
      {
        filters: [
          { dataSize: 165 }, // size of a token account
          {
            memcmp: {
              offset: 0,
              bytes: tokenMint.toBase58()
            }
          }
        ]
      }
    );

    // Extract unique owners
    const holders = tokenAccounts.map((account) => {
      return account.account.data.parsed.info.owner;
    });

    // Remove duplicates just in case
    const uniqueHolders = Array.from(new Set(holders));

    res.status(200).json({ holders: uniqueHolders });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
