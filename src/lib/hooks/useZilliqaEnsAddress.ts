import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";
import { CONTRACTS } from "../../config/constants";
import { getChainPublicClient } from "../utils/getChainPublicClient";
import L2ResolverAbi from "../abis/L2ResolverAbi";
import { zilliqa, zilliqaTestnet } from "../../config/chains";
import { namehash } from "viem/ens";

export type UseZilliqaEnsAddressProps = {
  name?: string;
  chainId?: number;
};

export type ZilliqaEnsAddressData = {
  address: string | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
};

export default function useZilliqaEnsAddress({ name, chainId }: UseZilliqaEnsAddressProps): ZilliqaEnsAddressData {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['ziladdress', name, chainId],
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
      
      console.log('Fetching address for name:', name, 'on chain:', chain.name);
      const client = getChainPublicClient(chain);
      
      try {
        const contractAddress = CONTRACTS.L2_RESOLVER_ADDR[chainId] as Address;
        if (!contractAddress) {
          console.log('No resolver contract for chain:', chainId);
          return null;
        }
        console.log('Calling contract at:', contractAddress);

        // Use namehash to convert the name to the node format expected by the contract
        const nameNode = namehash(name);
        console.log('Name node:', nameNode);

        // Call the addr function of the L2 resolver contract
        const address = await client.readContract({
          abi: L2ResolverAbi,
          address: contractAddress,
          functionName: "addr",
          args: [nameNode],
        }) as Address;
        
        console.log('Received address:', address);

        if (address) {
          return address;
        }

        return null;
      } catch (error) {
        console.error('Error fetching address:', error);
        throw error; // Let the error be caught by the error handler
      }
    },
    enabled: !!name && !!chainId && name.trim().length > 0,
  });

  return {
    address: data ?? null,
    isLoading,
    isFetching,
    error: error as Error | null,
  };
} 