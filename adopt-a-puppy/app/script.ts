import { Connection, PublicKey } from '@solana/web3.js';
import { Client } from 'pg';

async function updateHolders() {
  const connection = new Connection(process.env.SOLANA_RPC_ENDPOINT!);
  const tokenMint = new PublicKey(process.env.TOKEN_MINT_ADDRESS!);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

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

  for (const account of tokenAccounts) {
    const owner = account.account.data.parsed.info.owner;
    // Check if owner already exists in DB, if not insert
    // Assign NFT metadata if needed
    await client.query(
      `INSERT INTO holders (wallet, nft_metadata_uri, has_minted)
       VALUES ($1, $2, $3)
       ON CONFLICT (wallet) DO NOTHING;`,
      [owner, 'unique_metadata_uri_for_this_holder', false]
    );
  }
  
  await client.end();
}

updateHolders().then(() => console.log("Holders updated"));
