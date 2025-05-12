'use client';
import { useEffect, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { AvatarComponent } from '@rainbow-me/rainbowkit';
import { Address } from 'viem';
import { useChainId, useEnsAvatar, useEnsName } from 'wagmi';
import { zilliqa } from '@/config/chains'; // Import Zilliqa chain config

export const CustomAvatar: AvatarComponent = ({ address, size }) => {
  const chainId = useChainId();
  const [imageError, setImageError] = useState(false);

  // 1. Fetch ENS name for the address on the Zilliqa chain
  const { data: ensName, isLoading: isNameLoading } = useEnsName({
    address: address as Address,
    chainId: zilliqa.id,
    query: {
      enabled: chainId === zilliqa.id, // Correctly placed inside query options
    }
  });

  // 2. Fetch ENS avatar using the fetched name, only if on Zilliqa chain and name exists
  const { data: ensAvatar, isLoading: isAvatarLoading } = useEnsAvatar({
    name: ensName!, 
    chainId: zilliqa.id, 
    query: {
      enabled: !!ensName && chainId === zilliqa.id, // Correctly placed inside query options
    }
  });

  useEffect(() => {
    setImageError(false);
  }, [address, chainId]);

  // Determine final avatar and loading state
  const avatar = chainId === zilliqa.id ? ensAvatar : null;
  const isLoading = chainId === zilliqa.id ? (isNameLoading || isAvatarLoading) : false;

  if (!isLoading && avatar && !imageError) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1b1f' // Keep background for potential transparent images
        }}
      >
        <img
          src={avatar}
          width={size}
          height={size}
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          alt={address}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }
  
  // Fallback to Jazzicon
  return (
    <div style={{ 
      width: size, 
      height: size, 
      borderRadius: '50%',
      overflow: 'hidden'
    }}>
      <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
    </div>
  );
}; 