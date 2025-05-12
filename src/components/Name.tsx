'use client';
import { Address } from 'viem';
import { useEnsName } from 'wagmi';
import { zilliqa } from '@/config/chains';
import { CustomAvatar } from './CustomAvatar';

interface NameProps {
  address?: Address;
  chainId?: number;
  className?: string;
  showAvatar?: boolean;
  hideAddress?: boolean;
}

export default function Name({ address, chainId, className, showAvatar = true, hideAddress = false }: NameProps) {
  const { data: name, isLoading: isNameLoading } = useEnsName({
    address: address as Address,
    chainId: zilliqa.id,
    query: {
      enabled: !!address && chainId === zilliqa.id,
    }
  });

  console.log('Name component ENS result:', { name });

  if (!address) return null;

  return (
    <div className="flex items-center gap-2">
      {showAvatar && (
        <CustomAvatar address={address as Address} size={16} />
      )}
      <span className={className}>
        {!isNameLoading && name ? name : (!hideAddress ? `${address.slice(0, 6)}...${address.slice(-4)}` : '')}
      </span>
    </div>
  );
}