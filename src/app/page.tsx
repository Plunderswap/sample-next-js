'use client';

import { useState, useEffect } from 'react';
import { isAddress } from 'viem';
import { zilliqa } from '@/config/chains';
import useZilliqaEnsName from '@/lib/hooks/useZilliqaEnsName';
import useZilEnsAvatar from '@/lib/hooks/useZilEnsAvatar';
import useZilliqaEnsAddress from '@/lib/hooks/useZilliqaEnsAddress';
import Image from 'next/image';

export default function Home() {
  // Name to Address state
  const [nameInput, setNameInput] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [shouldResolveAddress, setShouldResolveAddress] = useState(false);
  
  // Address to Name state
  const [addressInput, setAddressInput] = useState('');
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [shouldResolveName, setShouldResolveName] = useState(false);

  // Avatar state
  const [showAddressAvatar, setShowAddressAvatar] = useState(false);
  const [showNameAvatar, setShowNameAvatar] = useState(false);

  // ENS name to address resolution - using our custom Zilliqa hook
  const { 
    address: ensAddress, 
    isLoading: isLoadingEnsAddress, 
    error: errorEnsAddress 
  } = useZilliqaEnsAddress({
    name: shouldResolveAddress ? nameInput.trim() : undefined,
    chainId: zilliqa.id,
  });

  // Address to ENS name resolution - using Zilliqa-specific hook
  const { 
    name: ensName, 
    isLoading: isLoadingEnsName 
  } = useZilliqaEnsName({
    // Only provide an address when we want to resolve
    address: shouldResolveName && isAddress(addressInput.trim()) 
      ? addressInput.trim() as `0x${string}` 
      : undefined,
    chainId: zilliqa.id,
  });

  // Avatar lookup for an address
  const {
    avatar: addressAvatar,
    isLoading: isLoadingAddressAvatar
  } = useZilEnsAvatar({
    address: showAddressAvatar && isAddress(addressInput.trim())
      ? addressInput.trim() as `0x${string}`
      : undefined,
    chainId: zilliqa.id
  });

  // Avatar lookup for a name
  const {
    avatar: nameAvatar,
    isLoading: isLoadingNameAvatar
  } = useZilEnsAvatar({
    address: showNameAvatar && resolvedAddress 
      ? resolvedAddress as `0x${string}`
      : undefined,
    chainId: zilliqa.id
  });

  // Handle name to address resolution
  const handleResolveAddress = () => {
    setResolvedAddress(null);
    setNameError(null);
    setShowNameAvatar(false);
    
    const trimmedName = nameInput.trim();
    setNameInput(trimmedName);

    if (!trimmedName) {
      setNameError('Please enter an ENS name.');
      return;
    }
    
    // Trigger resolution
    setShouldResolveAddress(true);
    console.log('Looking up name:', trimmedName);
  };

  // Handle address to name resolution
  const handleResolveName = () => {
    setResolvedName(null);
    setAddressError(null);
    setShowAddressAvatar(false);
    
    const trimmedAddress = addressInput.trim();
    setAddressInput(trimmedAddress);

    if (!trimmedAddress) {
      setAddressError('Please enter an EVM 0x address.');
      return;
    }

    if (!isAddress(trimmedAddress)) {
      setAddressError('Invalid EVM 0x address format.');
      return;
    }
    
    // Trigger resolution
    setShouldResolveName(true);
    console.log('Looking up address:', trimmedAddress);
  };

  // Handle avatar lookup for address
  const handleAddressAvatar = () => {
    if (resolvedName) {
      setShowAddressAvatar(true);
    }
  };

  // Handle avatar lookup for name
  const handleNameAvatar = () => {
    if (resolvedAddress) {
      setShowNameAvatar(true);
    }
  };

  // Turn off resolution when input changes
  useEffect(() => {
    setShouldResolveAddress(false);
    setShowNameAvatar(false);
  }, [nameInput]);

  useEffect(() => {
    setShouldResolveName(false);
    setShowAddressAvatar(false);
  }, [addressInput]);

  // Update state when ENS address lookup completes
  useEffect(() => {
    console.log('ENS address result:', ensAddress);
    
    if (!isLoadingEnsAddress && shouldResolveAddress) {
      if (errorEnsAddress) {
        setNameError(`ENS Address lookup failed: ${errorEnsAddress.message}`);
        setResolvedAddress(null);
      } else if (ensAddress) {
        setResolvedAddress(ensAddress);
        setNameError(null); // Clear any previous error when we have a result
      } else if (nameInput.trim().length > 0) {
        setNameError('No address found for this ENS name.');
        setResolvedAddress(null);
      }
    }
  }, [ensAddress, errorEnsAddress, isLoadingEnsAddress, nameInput, shouldResolveAddress]);

  // Update state when ENS name lookup completes
  useEffect(() => {
    console.log('ENS name result:', ensName);
    console.log('Input address:', addressInput.trim());
    console.log('Is address valid:', isAddress(addressInput.trim()));
    
    if (!isLoadingEnsName && shouldResolveName) {
      if (ensName) {
        setResolvedName(ensName);
        setAddressError(null); // Clear any previous error when we have a result
      } else if (addressInput.trim().length > 0 && isAddress(addressInput.trim())) {
        // Try logging a detailed debug message
        console.log('No ENS name found for address:', addressInput.trim());
        console.log('But address is valid, setting error message');
        
        // Provide a more specific error message
        setAddressError('No ENS name found for this address. The address might not have a reverse record set.');
        setResolvedName(null);
      }
    }
  }, [ensName, isLoadingEnsName, addressInput, shouldResolveName]);

  // Track avatar resolution
  useEffect(() => {
    console.log('Avatar for address:', addressAvatar);
  }, [addressAvatar]);

  useEffect(() => {
    console.log('Avatar for name:', nameAvatar);
  }, [nameAvatar]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-5 w-full max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Zilnames ENS Resolver
        </h1>

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
              disabled={isLoadingEnsAddress || !nameInput.trim()}
              className="w-full px-4 py-2 mb-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoadingEnsAddress ? 'Resolving...' : 'Resolve Address'}
            </button>

            {resolvedAddress && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                <p className="font-semibold">Address:</p>
                <p className="break-all">{resolvedAddress}</p>
                <button
                  onClick={handleNameAvatar}
                  disabled={isLoadingNameAvatar}
                  className="mt-2 px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 border border-indigo-300 rounded-md hover:bg-indigo-200 disabled:opacity-50"
                >
                  {isLoadingNameAvatar ? 'Loading...' : 'View Avatar'}
                </button>
                {showNameAvatar && (
                  <div className="mt-2">
                    {nameAvatar ? (
                      <div className="flex justify-center">
                        <img 
                          src={nameAvatar} 
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

            {nameError && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{nameError}</p>
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
              disabled={isLoadingEnsName || !addressInput.trim()}
              className="w-full px-4 py-2 mb-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoadingEnsName ? 'Resolving...' : 'Resolve Zilname'}
            </button>

            {resolvedName && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                <p className="font-semibold">ENS Name:</p>
                <p className="break-all">{resolvedName}</p>
                <button
                  onClick={handleAddressAvatar}
                  disabled={isLoadingAddressAvatar}
                  className="mt-2 px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 border border-indigo-300 rounded-md hover:bg-indigo-200 disabled:opacity-50"
                >
                  {isLoadingAddressAvatar ? 'Loading...' : 'View Avatar'}
                </button>
                {showAddressAvatar && (
                  <div className="mt-2">
                    {addressAvatar ? (
                      <div className="flex justify-center">
                        <img 
                          src={addressAvatar} 
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

            {addressError && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{addressError}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
