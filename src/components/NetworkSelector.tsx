'use client';

import { useAccount, useChainId, useConfig, useSwitchChain } from 'wagmi';
import { useState, useRef, useEffect } from 'react';

export function NetworkSelector() {
  const config = useConfig();
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isConnected) return null;

  const currentChain = config.chains.find(c => c.id === chainId) ?? config.chains[0];

  // Sort chains to put Zilliqa first
  const sortedChains = [...config.chains].sort((a, b) => {
    if (a.name.includes('Zilliqa')) return -1;
    if (b.name.includes('Zilliqa')) return 1;
    return 0;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="wallet-button flex items-center gap-2"
      >
        <div className="flex items-center gap-1">
          {currentChain.name && (
            <img
              alt={currentChain.name ?? 'Chain icon'} 
              src={`/chain-icons/${currentChain.id}.png`}
              width={16}
              height={16}
              style={{ borderRadius: '50%' }}
            />
          )}
          <span className="text-sm font-medium text-white">
            {currentChain.name}
          </span>
        </div>
        {/* Dropdown arrow */}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#1A1B1F] py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          {sortedChains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => {
                switchChain({ chainId: chain.id });
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#2D2D2D] ${
                chain.id === currentChain.id ? 'bg-[#2D2D2D]' : ''
              }`}
            >
              <img
                alt={chain.name ?? 'Chain icon'}
                src={`/chain-icons/${chain.id}.png`}
                width={16}
                  height={16}
                  style={{ borderRadius: '50%' }}
              />
              {chain.name}
              {chain.id === currentChain.id && (
                <svg className="ml-auto h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}