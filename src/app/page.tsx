'use client';
import { useState, useEffect } from 'react';
import { Address, isAddress, createPublicClient, http, toHex } from 'viem';
import { getEnsAddress, getEnsName, normalize, packetToBytes, getEnsAvatar } from 'viem/ens';
import { zilliqa } from '@/config/chains';
import { formatUnits } from 'viem';

// Viem public client for Zilliqa mainnet
const viemClient = createPublicClient({
  chain: zilliqa,
  transport: http(),
});

export default function Home() {
  // Name to Address state (using Viem)
  const [nameInput, setNameInput] = useState('');
  const [viemResolvedAddress, setViemResolvedAddress] = useState<string | null>(null);
  const [viemNameError, setViemNameError] = useState<string | null>(null);
  const [isLoadingViemEnsAddress, setIsLoadingViemEnsAddress] = useState(false);
  const [viemNameAvatar, setViemNameAvatar] = useState<string | null>(null);
  const [showViemNameAvatar, setShowViemNameAvatar] = useState(false);
  const [isLoadingViemNameAvatar, setIsLoadingViemNameAvatar] = useState(false);

  // Address to Name state (using Viem)
  const [addressInput, setAddressInput] = useState('');
  const [viemResolvedName, setViemResolvedName] = useState<string | null>(null);
  const [viemAddressError, setViemAddressError] = useState<string | null>(null);
  const [isLoadingViemEnsName, setIsLoadingViemEnsName] = useState(false);
  const [viemAddressAvatar, setViemAddressAvatar] = useState<string | null>(null);
  const [showViemAddressAvatar, setShowViemAddressAvatar] = useState(false);
  const [isLoadingViemAddressAvatar, setIsLoadingViemAddressAvatar] = useState(false);

  // ERC20 Token Details state
  const [tokenAddressInput, setTokenAddressInput] = useState('');
  const [tokenDetails, setTokenDetails] = useState<{ name: string | null; symbol: string | null; decimals: number | null; totalSupply: string | null; } | null>(null);
  const [isLoadingTokenDetails, setIsLoadingTokenDetails] = useState(false);
  const [tokenDetailsError, setTokenDetailsError] = useState<string | null>(null);

  // Minimal ERC20 ABI for fetching details
  const erc20Abi = [
    {
      inputs: [],
      name: 'name',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [{ name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const;

  // Handle name to address resolution (using Viem)
  const handleResolveAddress = async () => {
    // Reset Viem states
    setViemResolvedAddress(null);
    setViemNameError(null);
    setViemNameAvatar(null);
    setShowViemNameAvatar(false);
    
    const trimmedName = nameInput.trim();
    setNameInput(trimmedName);

    if (!trimmedName) {
      setViemNameError('Please enter an ENS name.');
      return;
    }
    
    // Trigger Viem resolution
    setIsLoadingViemEnsAddress(true);
    console.log('Looking up name (Viem):', trimmedName);
    try {
      const address = await getEnsAddress(viemClient, { name: normalize(trimmedName) });
      setViemResolvedAddress(address);
      if (!address) {
        setViemNameError('No address found for this ENS name.');
      } else {
        setViemNameError(null); // Clear error on success
      }
    } catch (e: any) {
      console.error('Viem ENS address lookup error:', e);
      setViemNameError(`ENS lookup failed: ${e.message}`);
    } finally {
      setIsLoadingViemEnsAddress(false);
    }
  };

  // Handle address to name resolution (using Viem)
  const handleResolveName = async () => {
    // Reset Viem states
    setViemResolvedName(null);
    setViemAddressError(null);
    setViemAddressAvatar(null);
    setShowViemAddressAvatar(false);
    
    const trimmedAddress = addressInput.trim();
    setAddressInput(trimmedAddress);

    if (!trimmedAddress) {
      setViemAddressError('Please enter an EVM 0x address.');
      return;
    }

    if (!isAddress(trimmedAddress)) {
      setViemAddressError('Invalid EVM 0x address format.');
      return;
    }
    
    // Trigger Viem resolution
    setIsLoadingViemEnsName(true);
    console.log('--- Viem getEnsName() Path ---');
    console.log('Input Address for Viem getEnsName():', trimmedAddress as Address);
    
    // Optional: Keep debug logging if useful
    const viemStyleReverseNameString = `${trimmedAddress.toLowerCase().substring(2)}.addr.reverse`;
    const dnsEncodedViemStyleReverseName = toHex(packetToBytes(viemStyleReverseNameString));
    const iNameResolverSelector = '0x691f3431';
    console.log('Viem will construct this reverse name string:', viemStyleReverseNameString);
    console.log('Viem will DNS-encode it to (arg1 for ZUR.resolve):', dnsEncodedViemStyleReverseName);
    console.log('Viem will use INameResolver selector (arg2 for ZUR.resolve):', iNameResolverSelector);
    console.log('Target Universal Resolver for Viem call:', viemClient.chain?.contracts?.ensUniversalResolver?.address || 'Using viemClient default behavior for Zilliqa');

    try {
      console.time('Viem getEnsName execution');
      const name = await getEnsName(viemClient, { address: trimmedAddress as Address });
      console.timeEnd('Viem getEnsName execution');
      console.log('Result from Viem getEnsName():', name);

      setViemResolvedName(name);
      if (!name) {
        setViemAddressError('No ENS name found for this address (e.g., reverse record not set).');
      } else {
        setViemAddressError(null); // Clear error on success
      }
    } catch (e: any) {
      console.error('Viem ENS name lookup error:', e);
      setViemAddressError(`ENS lookup failed: ${e.message}`);
    } finally {
      setIsLoadingViemEnsName(false);
    }
  };

  // Fetch Viem avatar for a name (triggered after address resolution)
  const handleViemNameAvatar = async () => {
    // Use the input name that was used for address resolution
    const trimmedName = nameInput.trim(); 
    if (!trimmedName || !viemResolvedAddress) return; // Need name and resolved address

    setIsLoadingViemNameAvatar(true);
    setViemNameAvatar(null); // Reset avatar before fetching
    setShowViemNameAvatar(true); // Show loading state
    
    try {
      console.log('Fetching avatar for name via Viem (using getEnsAvatar):', trimmedName);
      
      let normalizedName;
      try {
        normalizedName = normalize(trimmedName);
      } catch (error) {
        console.error('Error normalizing name:', error);
        setViemNameAvatar(null); 
        // setViemNameError('Invalid ENS name format for avatar lookup'); // Optionally show error
        setShowViemNameAvatar(false); // Hide avatar display area
        setIsLoadingViemNameAvatar(false); // Ensure loading stops
        return; // Stop execution
      }
      
      const avatarUrl = await getEnsAvatar(viemClient, {
        name: normalizedName,
      });
      
      console.log('Viem getEnsAvatar result for name:', avatarUrl);
      setViemNameAvatar(avatarUrl); // Set avatar URL (null if not found)
      
    } catch (e: any) {
      console.error('Error fetching Viem avatar for name:', e);
      setViemNameAvatar(null); 
      // setViemNameError(`Avatar lookup failed: ${e.message}`); // Optionally show error
    } finally {
      setIsLoadingViemNameAvatar(false);
    }
  };

  // Fetch Viem avatar for an address (triggered after name resolution)
  const handleViemAddressAvatar = async () => {
    if (!viemResolvedName) return; // Need the resolved name to look up avatar
    
    setIsLoadingViemAddressAvatar(true);
    setViemAddressAvatar(null); // Reset avatar before fetching
    setShowViemAddressAvatar(true); // Show loading state
    
    try {
      console.log('Fetching avatar for address via Viem (using getEnsAvatar on resolved name):', viemResolvedName);
      
      // Note: getEnsAvatar requires the name, not the address. 
      // We use the name we just resolved.
      const avatarUrl = await getEnsAvatar(viemClient, {
        name: viemResolvedName, 
      });
      
      console.log('Viem getEnsAvatar result for address:', avatarUrl);
      setViemAddressAvatar(avatarUrl); // Set avatar URL (null if not found)

    } catch (e: any) {
      console.error('Error fetching Viem avatar for address:', e);
      setViemAddressAvatar(null); 
      // setViemAddressError(`Avatar lookup failed: ${e.message}`); // Optionally show error
    } finally {
      setIsLoadingViemAddressAvatar(false);
    }
  };

  // Fetch ERC20 Token Details
  const handleFetchTokenDetails = async () => {
    setTokenDetails(null);
    setTokenDetailsError(null);
    setIsLoadingTokenDetails(true);

    const trimmedAddress = tokenAddressInput.trim();
    setTokenAddressInput(trimmedAddress);

    if (!trimmedAddress) {
      setTokenDetailsError('Please enter a token contract address.');
      setIsLoadingTokenDetails(false);
      return;
    }

    if (!isAddress(trimmedAddress)) {
      setTokenDetailsError('Invalid EVM 0x address format.');
      setIsLoadingTokenDetails(false);
      return;
    }

    try {
      console.log('Fetching ERC20 details for address:', trimmedAddress);
      
      // Use Promise.all to fetch details concurrently
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        viemClient.readContract({
          address: trimmedAddress as Address,
          abi: erc20Abi,
          functionName: 'name',
        }),
        viemClient.readContract({
          address: trimmedAddress as Address,
          abi: erc20Abi,
          functionName: 'symbol',
        }),
        viemClient.readContract({
          address: trimmedAddress as Address,
          abi: erc20Abi,
          functionName: 'decimals',
        }),
        viemClient.readContract({
          address: trimmedAddress as Address,
          abi: erc20Abi,
          functionName: 'totalSupply',
        }),
      ]);

      console.log('Fetched details:', { name, symbol, decimals, totalSupply });

      // Format totalSupply using decimals
      const formattedTotalSupply = typeof decimals === 'number' && totalSupply !== undefined
        ? formatUnits(totalSupply, decimals)
        : 'N/A (could not format)';

      setTokenDetails({ 
        name: name || 'N/A', 
        symbol: symbol || 'N/A', 
        decimals: typeof decimals === 'number' ? decimals : null, // Store raw decimals
        totalSupply: formattedTotalSupply, // Store formatted supply
      });
      setTokenDetailsError(null); // Clear error on success

    } catch (e: any) {
      console.error('Error fetching token details:', e);
      // Better error handling for contract calls
      if (e.message.includes('reverted') || e.message.includes('call exception')) {
          setTokenDetailsError('Contract call failed. Is this a valid ERC20 contract address on Zilliqa?');
      } else {
          setTokenDetailsError(`Failed to fetch details: ${e.message}`);
      }
      setTokenDetails(null);
    } finally {
      setIsLoadingTokenDetails(false);
    }
  };

  // Clear results when input changes
  useEffect(() => {
    // Reset Viem states for name resolution
    setViemResolvedAddress(null);
    setViemNameError(null);
    setViemNameAvatar(null);
    setShowViemNameAvatar(false);
    setIsLoadingViemEnsAddress(false); // Reset loading state if needed
    setIsLoadingViemNameAvatar(false);
  }, [nameInput]);

  useEffect(() => {
    // Reset Viem states for address resolution
    setViemResolvedName(null);
    setViemAddressError(null);
    setViemAddressAvatar(null);
    setShowViemAddressAvatar(false);
    setIsLoadingViemEnsName(false); // Reset loading state if needed
    setIsLoadingViemAddressAvatar(false);
  }, [addressInput]);

  // Clear token details when token address input changes
  useEffect(() => {
    setTokenDetails(null);
    setTokenDetailsError(null);
    setIsLoadingTokenDetails(false);
  }, [tokenAddressInput]);

  return (
    <div className="flex flex-col items-center justify-center">
      <main className="flex flex-col items-center justify-center flex-1 px-5 w-full max-w-4xl mx-auto">
        {/* Added Title and Description */}
        <h1 className="text-2xl font-bold mb-2 mt-8">
          <a href="https://github.com/Plunderswap/sample-next-js" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">
            PlunderSwap Sample Next.js Project
          </a>
        </h1>
        <p className="text-center mb-2 text-gray-600">
          Brought to you by the PlunderSwap team, a little next.js demo of a site with Wagmi, Viem, Rainbowkit and ZilNames integrated!
        </p>
        <p className="text-center mb-8 text-gray-600">
          Shows how to use Viem and Zilnames with customized Rainbowkit. A little read demo of calling Zilliqa EVM Smart Contracts as well!
        </p>

        <h2 className="text-xl font-semibold mb-4">
          Zilnames Resolver (Viem)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* ENS Name to Address Section */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Name to Address</h2>
            <div className="mb-4">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter Zilname (e.g. darthgus.zil)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <button
              onClick={handleResolveAddress}
              disabled={isLoadingViemEnsAddress || !nameInput.trim()}
              className="w-full px-4 py-2 mb-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoadingViemEnsAddress ? 'Resolving...' : 'Resolve Address'}
            </button>

            {/* Viem ENS Address Resolution Results */}
            {viemResolvedAddress && (
              <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
                <p className="font-semibold">Address:</p>
                <p className="break-all">{viemResolvedAddress}</p>
                <button
                  onClick={handleViemNameAvatar}
                  disabled={isLoadingViemNameAvatar}
                  className="mt-2 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 disabled:opacity-50"
                >
                  {isLoadingViemNameAvatar ? 'Loading Avatar...' : 'View Avatar'}
                </button>
                {showViemNameAvatar && (
                  <div className="mt-2">
                    {isLoadingViemNameAvatar ? <p className="text-sm text-gray-500">Loading avatar...</p> : viemNameAvatar ? (
                      <div className="flex justify-center">
                        <img 
                          src={viemNameAvatar} 
                          alt="Zilnames Avatar" 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="text-orange-600 text-sm">No avatar found</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Viem Name Error Display */}
            {viemNameError && (
              <div className="mt-4 p-4 bg-orange-100 border border-orange-400 text-orange-700 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{viemNameError}</p>
              </div>
            )}
          </div>

          {/* Address to ENS Name Section */}
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Address to Name</h2>
            <div className="mb-4">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter an EVM address (0x...)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <button
              onClick={handleResolveName}
              disabled={isLoadingViemEnsName || !addressInput.trim()}
              className="w-full px-4 py-2 mb-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoadingViemEnsName ? 'Resolving...' : 'Resolve Name'}
            </button>

            {/* Viem ENS Name Resolution Results */}
            {viemResolvedName && (
              <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
                <p className="font-semibold">Zilname:</p>
                <p className="break-all">{viemResolvedName}</p>
                <button
                  onClick={handleViemAddressAvatar}
                  disabled={isLoadingViemAddressAvatar}
                  className="mt-2 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 disabled:opacity-50"
                >
                  {isLoadingViemAddressAvatar ? 'Loading Avatar...' : 'View Avatar'}
                </button>
                {showViemAddressAvatar && (
                  <div className="mt-2">
                     {isLoadingViemAddressAvatar ? <p className="text-sm text-gray-500">Loading avatar...</p> : viemAddressAvatar ? (
                      <div className="flex justify-center">
                        <img 
                          src={viemAddressAvatar} 
                          alt="ENS Avatar" 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="text-orange-600 text-sm">No avatar found</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Viem Address Error Display */}
            {viemAddressError && (
              <div className="mt-4 p-4 bg-orange-100 border border-orange-400 text-orange-700 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{viemAddressError}</p>
              </div>
            )}
          </div>
        </div>

        {/* ERC20 Token Details Section - Added Below */}
        <div className="mt-8 w-full p-6 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">ERC20 Token Details (Demo on calling smart contracts)</h2>
          <div className="mb-4">
            <input
              type="text"
              value={tokenAddressInput}
              onChange={(e) => setTokenAddressInput(e.target.value)}
              placeholder="Enter ERC20 Token Address (0x...)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            />
          </div>

          <button
            onClick={handleFetchTokenDetails}
            disabled={isLoadingTokenDetails || !tokenAddressInput.trim()}
            className="w-full px-4 py-2 mb-4 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoadingTokenDetails ? 'Fetching...' : 'Get Token Details'}
          </button>

          {/* Token Details Results */}
          {tokenDetails && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              <p><span className="font-semibold">Name:</span> {tokenDetails.name}</p>
              <p><span className="font-semibold">Symbol:</span> {tokenDetails.symbol}</p>
              <p><span className="font-semibold">Decimals:</span> {tokenDetails.decimals !== null ? tokenDetails.decimals : 'N/A'}</p>
              <p><span className="font-semibold">Total Supply:</span> {tokenDetails.totalSupply}</p>
            </div>
          )}

          {/* Token Details Error Display */}
          {tokenDetailsError && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{tokenDetailsError}</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
