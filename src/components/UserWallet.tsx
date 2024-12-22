'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi';
import { useEffect, useState } from 'react';
import Name from './Name';
import { formatUnits } from 'viem';
import { getRoundedAmount } from '../lib/utils/getRoundedAmount';

export default function UserWallet() {
  const { isConnected, isConnecting, isReconnecting, address } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    chainId,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isConnecting || isReconnecting || !isMounted) {
    return <div className="animate-spin">Loading...</div>;
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-[#E02424] text-sm md:text-base px-4 py-2 font-medium text-white hover:bg-[#C81E1E] transition-colors"
              style={{ transform: 'none' }}
            >
              Connect Wallet
            </button>
          );
        }

        return (
          <div className="relative">
            <button
              onClick={openAccountModal}
              type="button"
              className="bg-[#1A1B1F] hover:bg-[#2D2D2D] text-white text-sm md:text-base font-medium py-2 px-4 rounded-xl flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                {/* Balance */}
                {balance?.value && !isBalanceLoading && (
                  <div className="bg-[#1A1B1F] py-2 px-4 rounded-xl text-white text-sm md:text-base font-medium">
                    {getRoundedAmount(formatUnits(BigInt(balance.value.toString()), 18), 4)} ZIL
                  </div>
                )}
                
                {/* Address/Name */}
                <div className="flex items-center gap-2">
                  <Name
                    address={address}
                    chainId={chainId}
                    className="font-medium"
                  />
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
              </div>
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}