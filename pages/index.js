import { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [puppies, setPuppies] = useState([]);
  const [error, setError] = useState(null);

  const connection = new Connection("https://api.devnet.solana.com");

  const samplePuppies = [
    { name: "Puppy #1", image: "/puppies/puppy1.png" },
    { name: "Puppy #2", image: "/puppies/puppy2.png" },
    { name: "Puppy #3", image: "/puppies/puppy3.png" },
    { name: "Puppy #4", image: "/puppies/puppy4.png" },
    { name: "Puppy #5", image: "/puppies/puppy5.png" },
  ];

  const fetchWalletNFTs = async () => {
    try {
      setError(null);

      if (!walletAddress) {
        setError("Please enter a valid wallet address.");
        return;
      }

      const pubkey = new PublicKey(walletAddress);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        pubkey,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        }
      );

      const nftPuppies = tokenAccounts.value.map((account, index) => ({
        name: `Puppy #${index + 1}`,
        image: samplePuppies[index % samplePuppies.length].image,
      }));

      setPuppies(nftPuppies);
    } catch (err) {
      setError("Failed to fetch wallet data. Please check the wallet address.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-pink-500 text-white">
      <header className="flex justify-between items-center p-4 text-sm font-bold">
        <div>08:44</div>
        <div>LTE 88</div>
      </header>
      <main className="text-center p-6">
        <h1 className="text-3xl font-bold mb-4">Adopt a Solana Puppy</h1>
        <p className="mb-6">
          Enter a wallet address to see the unique puppies associated with it!
        </p>

        <div className="flex justify-center items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-2/3 px-3 py-2 rounded text-black"
          />
          <button
            onClick={fetchWalletNFTs}
            className="bg-yellow-300 text-black px-4 py-2 rounded font-medium"
          >
            Search
          </button>
        </div>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        <section className="puppy-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {puppies.length > 0 ? (
            puppies.map((puppy, index) => (
              <div
                key={index}
                className="puppy-card bg-white text-black rounded shadow-md p-4"
              >
                <img
                  src={puppy.image}
                  alt={puppy.name}
                  className="w-full h-auto rounded"
                />
                <div className="mt-2 text-sm font-bold">{puppy.name}</div>
              </div>
            ))
          ) : (
            <div className="text-white">No puppies found for this wallet.</div>
          )}
        </section>
      </main>
    </div>
  );
}
