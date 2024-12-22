import { useAccount } from "wagmi";
import { useMemo } from "react";
import { zilliqa, zilliqaTestnet } from "@/config/chains";
import { Chain, createPublicClient, http } from "viem";
import { Zilname } from "../types";
import { isDevelopment } from "@/config/constants";

export const USERNAME_DOMAINS: Record<number, string> = {
    [zilliqaTestnet.id]: "test.zil",
    [zilliqa.id]: "zil",
  };

export function getChainForZilname(username: Zilname): Chain {
    return username.endsWith(`.${USERNAME_DOMAINS[zilliqaTestnet.id]}`)
      ? zilliqaTestnet
      : zilliqa;
  }

export function getZilnamePublicClient(chainId: number) {
  const rpcEndpoint =
    chainId === zilliqaTestnet.id
      ? zilliqaTestnet.rpcUrls.default.http[0]
      : zilliqa.rpcUrls.default.http[0];
  const chain = chainId === zilliqaTestnet.id ? zilliqaTestnet : zilliqa;

  return createPublicClient({
    chain: chain,
    transport: http(rpcEndpoint),
  });
}

export const supportedChainIds: number[] = [zilliqa.id, zilliqaTestnet.id];
export function isZilnameSupportedChain(chainId: number) {
  return supportedChainIds.includes(chainId);
}

export default function useZilnameChain(username?: Zilname) {
  const { chain: connectedChain } = useAccount();

  const zilnameChain: Chain = useMemo(() => {
    // Assume chain based on name
    if (username) return getChainForZilname(username);

    // User is connected to a valid chain, return the connected chain
    if (connectedChain && supportedChainIds.includes(connectedChain.id)) {
      return connectedChain;
    }

    // Not connected, default to Testnet for development, Zilliqa for other envs
    return isDevelopment ? zilliqaTestnet : zilliqa;
  }, [connectedChain, username]);

  const zilnamePublicClient = getZilnamePublicClient(zilnameChain.id);

  return {
    zilnameChain,
    zilnamePublicClient,
  };
}