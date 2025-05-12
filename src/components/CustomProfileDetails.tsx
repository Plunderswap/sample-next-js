import React, { useCallback, useState, useEffect } from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { toBech32Address } from "@zilliqa-js/crypto";
import { formatUnits } from 'viem';
import { getRoundedAmount } from '@/lib/utils';
import Name from './Name';

interface CustomProfileDetailsProps {
  onClose: () => void;
  onDisconnect: () => void;
}

export function CustomProfileDetails({
  onClose,
  onDisconnect,
}: CustomProfileDetailsProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({ address });
  
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedZilAddress, setCopiedZilAddress] = useState(false);
  
  let zilAddress = "";
  if (address) {
    zilAddress = toBech32Address(address);
  }

  const copyAddressAction = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
    }
  }, [address]);

  const copyZilAddressAction = useCallback(() => {
    if (zilAddress) {
      navigator.clipboard.writeText(zilAddress);
      setCopiedZilAddress(true);
    }
  }, [zilAddress]);

  useEffect(() => {
    if (copiedAddress) {
      const timer = setTimeout(() => {
        setCopiedAddress(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copiedAddress]);

  useEffect(() => {
    if (copiedZilAddress) {
      const timer = setTimeout(() => {
        setCopiedZilAddress(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copiedZilAddress]);

  if (!address) {
    return null;
  }

  const displayBalance = balanceData ? 
    getRoundedAmount(formatUnits(balanceData.value, balanceData.decimals), 4) : 
    "0.00";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Mobile view (hidden on sm and above) */}
      <div className="sm:hidden bg-[#1A1B1F] rounded-xl shadow-lg w-full p-3 relative mx-4" style={{ maxWidth: '85%', maxHeight: '85vh', overflow: 'auto' }}>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center justify-center mb-3">
          <div className="scale-[3] mb-6 mt-4">
            <div className="flex justify-center">
              <Name
                address={address}
                chainId={chainId}
                showAvatar={true}
                hideAddress={true}
                className="!hidden"
              />
            </div>
          </div>
          
          <div className="mt-1 w-full">
            <h2 className="text-white text-base font-bold mb-1 text-center">Your Address</h2>
            <p className="text-gray-300 text-[12px] break-all mb-2 text-center">{address}</p>
            
            <h2 className="text-white text-base font-bold mb-1 text-center">Your Zil1 Address</h2>
            <p className="text-gray-300 text-[12px] break-all mb-2 text-center">{zilAddress}</p>
            
            <h2 className="text-white text-base font-bold mb-1 text-center">Balance</h2>
            <p className="text-gray-300 text-sm font-medium mb-2 text-center">{displayBalance} {balanceData?.symbol || 'ZIL'}</p>
          </div>
        </div>
        
        <div className="flex justify-between gap-1">
          <button
            onClick={copyAddressAction}
            className="flex items-center justify-center gap-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-1 px-1 rounded-full text-[10px] flex-1"
          >
            {copiedAddress ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>0x</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>0x</span>
              </>
            )}
          </button>
          
          <button
            onClick={copyZilAddressAction}
            className="flex items-center justify-center gap-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-1 px-1 rounded-full text-[10px] flex-1"
          >
            {copiedZilAddress ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Zil1</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Zil1</span>
              </>
            )}
          </button>
          
          <button
            onClick={onDisconnect}
            className="flex items-center justify-center gap-1 bg-[#E02424] hover:bg-[#C81E1E] text-white py-1 px-1 rounded-full text-[10px] flex-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Desktop view (hidden on xs and below) */}
      <div className="hidden sm:block bg-[#1A1B1F] rounded-xl shadow-lg max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="scale-[5] mb-16 mt-8">
            <div className="flex justify-center">
              <Name
                address={address}
                chainId={chainId}
                showAvatar={true}
                hideAddress={true}
                className="!hidden"
              />
            </div>
          </div>
          
          <div className="mt-4 w-full">
            <h2 className="text-white text-lg font-bold mb-2 text-center">Your Address</h2>
            <p className="text-gray-300 text-sm break-all mb-4 text-center">{address}</p>
            
            <h2 className="text-white text-lg font-bold mb-2 text-center">Your Zil1 Address</h2>
            <p className="text-gray-300 text-sm break-all mb-4 text-center">{zilAddress}</p>
            
            <h2 className="text-white text-lg font-bold mb-2 text-center">Balance</h2>
            <p className="text-gray-300 text-lg font-medium mb-4 text-center">{displayBalance} {balanceData?.symbol || 'ZIL'}</p>
          </div>
        </div>
        
        <div className="flex justify-between gap-3">
          <button
            onClick={copyAddressAction}
            className="flex items-center justify-center gap-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-1.5 px-3 rounded-full text-sm flex-1"
          >
            {copiedAddress ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copy 0x
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy 0x
              </>
            )}
          </button>
          
          <button
            onClick={copyZilAddressAction}
            className="flex items-center justify-center gap-1 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white py-1.5 px-3 rounded-full text-sm flex-1"
          >
            {copiedZilAddress ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copy Zil1
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Zil1
              </>
            )}
          </button>
          
          <button
            onClick={onDisconnect}
            className="flex items-center justify-center gap-1 bg-[#E02424] hover:bg-[#C81E1E] text-white py-1.5 px-3 rounded-full text-sm flex-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
} 