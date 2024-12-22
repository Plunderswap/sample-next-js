import { Address, isAddress } from "viem";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { CONTRACTS } from "../../config/constants";
import { convertReverseNodeToBytes } from "../../lib/utils/convertReverseNodeToBytes";
import { getChainPublicClient } from "../../lib/utils/getChainPublicClient";
import L2ResolverAbi from "../../lib/abis/L2ResolverAbi";
import { zilliqa, zilliqaTestnet } from "../../config/chains";

export type UseZilliqaEnsNameProps = {
  address?: Address;
  chainId?: number;
};

export type ZilliqaEnsNameData = {
  name: string | null;
  isLoading: boolean;
  isFetching: boolean;
};

export default function useZilliqaEnsName({ address, chainId }: UseZilliqaEnsNameProps): ZilliqaEnsNameData {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['zilname', address, chainId],
    queryFn: async () => {
      if (!address || !chainId) return null;
      
      // Get the appropriate chain configuration
      const chain = chainId === zilliqa.id ? zilliqa : 
                   chainId === zilliqaTestnet.id ? zilliqaTestnet : 
                   null;
      
      if (!chain) {
        console.log('Chain not supported:', chainId);
        return null;
      }
      
      console.log('Fetching zilname for address:', address, 'on chain:', chain.name);
      const client = getChainPublicClient(chain);
      
      const addressReverseNode = convertReverseNodeToBytes(address, chainId);
      console.log('Address reverse node:', addressReverseNode);

      try {
        const contractAddress = CONTRACTS.L2_RESOLVER_ADDR[chainId] as Address;
        if (!contractAddress) {
          console.log('No resolver contract for chain:', chainId);
          return null;
        }
        console.log('Calling contract at:', contractAddress);

        const zilname = await client.readContract({
          abi: L2ResolverAbi,
          address: contractAddress,
          functionName: "name",
          args: [addressReverseNode],
        }) as string;
        
        console.log('Received zilname:', zilname);

        if (zilname && zilname.length > 0) {
          return zilname;
        }

        return null;
      } catch (error) {
        console.error('Error fetching Zilname:', error);
        return null;
      }
    },
    enabled: !!address && !!chainId && isAddress(address),
  });

  return {
    name: data ?? null,
    isLoading,
    isFetching,
  };
}