import { useQuery } from "@tanstack/react-query";
import { getChainPublicClient } from "../../lib/utils/getChainPublicClient";
import { zilliqa, zilliqaTestnet } from "../../config/chains";
import { CONTRACTS } from "../../config/constants";
import L2ResolverAbi from "../../lib/abis/L2ResolverAbi";
import { convertReverseNodeToBytes } from "../../lib/utils/convertReverseNodeToBytes";
import { Address } from "viem";
import { IsValidIpfsUrl, getIpfsGatewayUrl, IpfsUrl } from "../../lib/utils/urls";
import useZilliqaEnsName from "./useZilliqaEnsName";
import { namehash } from "viem/ens";

export type UseZilEnsAvatarProps = {
  address?: Address;
  chainId?: number;
};

export type ZilEnsAvatarData = {
  avatar: string | null;
  isLoading: boolean;
  isFetching: boolean;
};

export default function useZilEnsAvatar({ address, chainId }: UseZilEnsAvatarProps): ZilEnsAvatarData {
  const { name, isLoading: isNameLoading } = useZilliqaEnsName({ address, chainId });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['zilavatar', name, chainId],
    queryFn: async () => {
      if (!name || !chainId) return null;
      
      // Get the appropriate chain configuration
      const chain = chainId === zilliqa.id ? zilliqa : 
                   chainId === zilliqaTestnet.id ? zilliqaTestnet : 
                   null;
      
      if (!chain) {
        console.log('Chain not supported:', chainId);
        return null;
      }
      
      console.log('Fetching avatar for name:', name, 'on chain:', chain.name);
      const client = getChainPublicClient(chain);
      
      try {
        const contractAddress = CONTRACTS.L2_RESOLVER_ADDR[chainId] as Address;
        if (!contractAddress) {
          console.log('No resolver contract for chain:', chainId);
          return null;
        }
        console.log('Calling contract at:', contractAddress);
        
        // Get the avatar text record using the name's namehash
        const avatar = await client.readContract({
          abi: L2ResolverAbi,
          address: contractAddress,
          functionName: "text",
          args: [namehash(name), "avatar"],
        }) as string;

        console.log('Raw avatar response:', avatar);

        if (!avatar) {
          console.log('No avatar found');
          return null;
        }

        // Handle IPFS URLs
        if (IsValidIpfsUrl(avatar)) {
          console.log('Avatar is IPFS URL:', avatar);
          const gatewayUrl = getIpfsGatewayUrl(avatar as IpfsUrl);
          console.log('Converted to gateway URL:', gatewayUrl);
          return gatewayUrl || null;
        }

        // Return the avatar URL directly if it's not IPFS
        console.log('Using direct avatar URL:', avatar);
        return avatar;
      } catch (error) {
        console.error('Error fetching avatar:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
        }
        return null;
      }
    },
    enabled: !!name && !isNameLoading && !!chainId,
  });

  return {
    avatar: data ?? null,
    isLoading: isLoading || isNameLoading,
    isFetching,
  };
} 