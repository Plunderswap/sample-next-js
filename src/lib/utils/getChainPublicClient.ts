import { Chain, createPublicClient, http } from "viem";

export function getChainPublicClient(chain: Chain) {
 return createPublicClient({
   chain,
   transport: http(chain.rpcUrls.default.http[0])
 });
}