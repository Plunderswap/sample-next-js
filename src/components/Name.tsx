'use client';
import { Address } from 'viem';
import useZilliqaEnsName from '@/lib/hooks/useZilliqaEnsName';
import useZilEnsAvatar from '@/lib/hooks/useZilEnsAvatar';
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

interface NameProps {
  address?: Address;
  chainId?: number;
  className?: string;
  showAvatar?: boolean;
  hideAddress?: boolean;
}

export default function Name({ address, chainId, className, showAvatar = true, hideAddress = false }: NameProps) {
  console.log('Name component props:', { address, chainId });
  
  const { name, isLoading: isNameLoading } = useZilliqaEnsName({ address, chainId });
  const { avatar, isLoading: isAvatarLoading } = useZilEnsAvatar({ address, chainId });

  console.log('Name component results:', { name, avatar });

  if (!address) return null;

  return (
    <div className="flex items-center gap-2">
      {showAvatar && (
        <div className="wallet-avatar">
          {avatar && !isAvatarLoading ? (
            <img 
              src={avatar} 
              alt={name || address} 
              className="w-4 h-4 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <Jazzicon diameter={16} seed={jsNumberForAddress(address)} />
          )}
        </div>
      )}
      <span className={className}>
        {!isNameLoading && name ? name : (!hideAddress ? `${address.slice(0, 6)}...${address.slice(-4)}` : '')}
      </span>
    </div>
  );
}