'use client';
import { useEffect, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { AvatarComponent } from '@rainbow-me/rainbowkit';
import { Address } from 'viem';
import useZilEnsAvatar from '@/lib/hooks/useZilEnsAvatar';
import { useChainId } from 'wagmi';

export const CustomAvatar: AvatarComponent = ({ address, size }) => {
  const chainId = useChainId();
  const { avatar, isLoading } = useZilEnsAvatar({ 
    address: address as Address,
    chainId 
  });
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    setImageError(false);
  }, [address, chainId]);

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
          backgroundColor: '#1a1b1f'
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