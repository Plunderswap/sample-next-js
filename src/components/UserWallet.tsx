"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi';
import { useState, useEffect, useRef } from 'react';
import Name from './Name';
import { formatUnits } from 'viem';
import { getRoundedAmount } from '@/lib/utils';
import { CustomProfileDetails } from './CustomProfileDetails';
import { defaultChain } from '@/config/wagmi';
import dynamic from 'next/dynamic';

// Dynamically import the CustomWalletList component with no SSR
const CustomWalletList = dynamic(
  () => import('./CustomWalletList'),
  { ssr: false }
);

export default function UserWallet() {
  const { isConnected, isConnecting, isReconnecting, address } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [showProfileDetails, setShowProfileDetails] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showCustomWalletList, setShowCustomWalletList] = useState<boolean>(false);
  const [hasEIP6963Wallets, setHasEIP6963Wallets] = useState<boolean>(false);
  const detectedWallets = useRef<number>(0);
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
  });

  useEffect(() => {
    setIsMounted(true);
    
    // Detect if we're on mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Check for EIP-6963 wallets
    if (typeof window !== 'undefined') {
      const handleAnnouncement = (event: any) => {
        if (event.detail && event.detail.info) {
          detectedWallets.current += 1;
          setHasEIP6963Wallets(true);
        }
      };
      
      window.addEventListener('eip6963:announceProvider', handleAnnouncement);
      
      // Request wallet announcements
      window.dispatchEvent(new Event('eip6963:requestProvider'));
      
      return () => {
        window.removeEventListener('resize', checkMobile);
        window.removeEventListener('eip6963:announceProvider', handleAnnouncement);
      };
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (isConnecting || isReconnecting || !isMounted) {
    return <div className="animate-spin">Loading...</div>;
  }

  const handleDisconnect = () => {
    disconnect();
    setShowProfileDetails(false);
  };

  const handleConnectClick = () => {
    // On mobile, check if we have EIP-6963 wallets
    if (isMobile) {
      if (hasEIP6963Wallets) {
        // If we have EIP-6963 wallets, show our custom wallet list
        setShowCustomWalletList(true);
      } else {
        // Otherwise, use RainbowKit's modal
        // Request wallet announcements one more time to be sure
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('eip6963:requestProvider'));
          
          // Give wallets a short time to announce themselves
          setTimeout(() => {
            if (detectedWallets.current > 0) {
              setHasEIP6963Wallets(true);
              setShowCustomWalletList(true);
            } else {
              // If still no wallets, use RainbowKit's modal
              openConnectModal();
            }
          }, 100);
        } else {
          openConnectModal();
        }
      }
    } else {
      // On desktop, use RainbowKit's modal
      openConnectModal();
    }
  };

  return (
    <>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted && isMounted;
          const connected = ready && account && chain;

          if (!connected) {
            return (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // On mobile, check if we have EIP-6963 wallets
                    if (isMobile) {
                      if (hasEIP6963Wallets) {
                        // If we have EIP-6963 wallets, show our custom wallet list
                        setShowCustomWalletList(true);
                      } else {
                        // Otherwise, use RainbowKit's modal
                        // Request wallet announcements one more time to be sure
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new Event('eip6963:requestProvider'));
                          
                          // Give wallets a short time to announce themselves
                          setTimeout(() => {
                            if (detectedWallets.current > 0) {
                              setHasEIP6963Wallets(true);
                              setShowCustomWalletList(true);
                            } else {
                              // If still no wallets, use RainbowKit's modal
                              openConnectModal();
                            }
                          }, 100);
                        } else {
                          openConnectModal();
                        }
                      }
                    } else {
                      // On desktop, use RainbowKit's modal
                      openConnectModal();
                    }
                  }}
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-[#E02424] text-sm md:text-base px-4 py-2 font-medium text-white hover:bg-[#C81E1E] transition-colors"
                  style={{ transform: 'none' }}
                >
                  Connect Wallet
                </button>
              </div>
            );
          }

          // Check if the current chain is the default chain
          const isWrongNetwork = chain && (chain.unsupported || chain.id !== defaultChain.id);
          
          if (isWrongNetwork) {
            return (
              <button
                onClick={openChainModal}
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-[#FF6B6B] text-sm md:text-base px-4 py-2 font-medium text-white hover:bg-[#FF4F4F] transition-colors"
                style={{ transform: 'none' }}
              >
                Wrong network
              </button>
            );
          }

          return (
            <div className="relative">
              <button
                onClick={() => setShowProfileDetails(true)}
                type="button"
                className="bg-[#1A1B1F] hover:bg-[#2D2D2D] text-white text-sm md:text-base font-medium py-2 px-4 rounded-xl flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  {/* Balance - Only show on desktop */}
                  {balance?.value && !isBalanceLoading && (
                    <div className="hidden md:block bg-[#1A1B1F] py-2 px-4 rounded-xl text-white text-sm md:text-base font-medium">
                      {getRoundedAmount(formatUnits(BigInt(balance.value.toString()), 18), 4)} ZIL
                    </div>
                  )}
                  
                  {/* Address/Name */}
                  <div className="flex items-center gap-2 max-w-[150px] md:max-w-none">
                    <Name
                      address={address}
                      chainId={chainId}
                      className="font-medium truncate"
                      showAvatar={true}
                    />
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                  </div>
                </div>
              </button>
            </div>
          );
        }}
      </ConnectButton.Custom>

      {showProfileDetails && isConnected && (
        <CustomProfileDetails
          onClose={() => setShowProfileDetails(false)}
          onDisconnect={handleDisconnect}
        />
      )}
      
      {showCustomWalletList && (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <CustomWalletList 
              onClose={() => setShowCustomWalletList(false)}
              openRainbowKitModal={() => {
                setShowCustomWalletList(false);
                setTimeout(() => {
                  openConnectModal();
                }, 100);
              }}
            />
          )}
        </ConnectButton.Custom>
      )}
    </>
  );
} 