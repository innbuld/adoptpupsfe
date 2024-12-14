"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // State for token holders
  const [holders, setHolders] = useState<string[]>([]);
  const [holdersLoading, setHoldersLoading] = useState<boolean>(true);
  const [isHolderResult, setIsHolderResult] = useState<boolean | null>(null);

  // Placeholder puppy data
  const puppies = [
    { name: "Wallet #1", image: "/puppies/puppy1.png" },
    { name: "Wallet #2", image: "/puppies/puppy2.png" },
    { name: "Wallet #3", image: "/puppies/puppy3.png" },
    { name: "Wallet #4", image: "/puppies/puppy4.png" },
    { name: "Wallet #5", image: "/puppies/puppy5.png" },
  ];

  // Randomly select a puppy of the day
  const puppyOfTheDay = puppies[Math.floor(Math.random() * puppies.length)];

  // Real-time clock for the header
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all holders on mount
  useEffect(() => {
    const fetchHolders = async () => {
      try {
        const res = await fetch("/api/holders");
        const data = await res.json();
        setHolders(data.holders || []);
      } catch (err) {
        console.error("Error fetching holders:", err);
      } finally {
        setHoldersLoading(false);
      }
    };

    fetchHolders();
  }, []);

  // Handle wallet search - check if the entered address is a holder
  const handleSearch = async () => {
    if (!walletAddress) {
      setError("Please enter a valid wallet address.");
      return;
    }

    setError(null);
    setLoading(true);
    setIsHolderResult(null);

    try {
      const res = await fetch(`/api/holder/${walletAddress}`);
      const data = await res.json();
      if (res.ok) {
        setIsHolderResult(data.isHolder);
      } else {
        setError(data.error || "Unknown error occurred.");
      }
    } catch (err: any) {
      setError("Error fetching holder data.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic for puppies
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPuppies = puppies.slice(indexOfFirst, indexOfLast);

  // Dynamic colors for puppy cards
  const colors = ["bg-blue-200", "bg-green-200", "bg-yellow-200", "bg-red-200"];

  return (
    <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-pink-500 text-black"} min-h-screen`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 bg-gray-200 p-2 rounded"
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full p-6">
        {/* Holders Section */}
        <div className="bg-yellow-300 px-4 py-2 rounded-md mb-4 w-full max-w-xl">
          <h2 className="text-xl font-bold mb-2">Holders</h2>
          {holdersLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-auto max-h-40">
              <ul className="list-disc ml-5">
                {holders.map((holder) => (
                  <li key={holder}>{holder}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">Adopt a Solana Puppy</h1>
        <p className="text-center mb-6">
          Every wallet gets a unique, algorithmically generated puppy companion.
        </p>

        {/* Contract Address */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-medium">Contract Address:</span>
          <input
            type="text"
            value="AhnCaNPQ8...pump"
            readOnly
            className="bg-white px-2 py-1 rounded text-black"
          />
          <button
            className="bg-yellow-300 px-3 py-1 rounded font-medium"
            onClick={() => {
              navigator.clipboard.writeText("AhnCaNPQ8...pump");
              alert("Contract Address Copied!");
            }}
          >
            Copy
          </button>
        </div>

        {/* Search Wallet */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter Solana wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-64 px-3 py-2 rounded text-black"
          />
          <button
            onClick={handleSearch}
            className="bg-yellow-300 px-4 py-2 rounded font-medium"
          >
            Search
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading && (
          <div className="flex items-center justify-center my-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-300"></div>
          </div>
        )}
        {isHolderResult !== null && (
          <div className="mb-4">
            {isHolderResult ? (
              <p className="text-green-600 font-bold">{walletAddress} is a holder!</p>
            ) : (
              <p className="text-red-600 font-bold">{walletAddress} is not a holder.</p>
            )}
          </div>
        )}

        {/* Puppy of the Day */}
        <div className="mb-6 p-4 bg-green-200 rounded">
          <h2 className="text-2xl font-bold mb-2">Puppy of the Day</h2>
          <img src={puppyOfTheDay.image} alt={puppyOfTheDay.name} className="rounded w-40 h-40" />
          <h3 className="font-bold">{puppyOfTheDay.name}</h3>
        </div>

        {/* Puppy Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          {currentPuppies.map((puppy, index) => (
            <div
              key={index}
              className={`rounded-md shadow-md p-4 flex flex-col items-center ${
                colors[index % colors.length]
              } transition-transform hover:scale-105 duration-300`}
            >
              <img src={puppy.image} alt={puppy.name} className="w-full h-auto rounded mb-2" />
              <h3 className="font-bold">{puppy.name}</h3>
            </div>
          ))}
        </section>

        {/* Pagination */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-yellow-300 px-3 py-1 rounded font-medium"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev * itemsPerPage >= puppies.length ? prev : prev + 1
              )
            }
            disabled={currentPage * itemsPerPage >= puppies.length}
            className="bg-yellow-300 px-3 py-1 rounded font-medium"
          >
            Next
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center p-4 bg-black text-white mt-8">
        adoptapuppy.fun
      </footer>
    </div>
  );
}
