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
}

export default function Name({ address, chainId, className, showAvatar = true }: NameProps) {
  const { name } = useZilliqaEnsName({ address, chainId });
  const { avatar, isLoading: isAvatarLoading } = useZilEnsAvatar({ address, chainId });

  if (!address) return null;

  return (
    <div className="flex items-center gap-2">
      {showAvatar && (
        <div className="wallet-avatar">
          {avatar ? (
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
        {name || `${address.slice(0, 6)}...${address.slice(-4)}`}
      </span>
    </div>
  );
}