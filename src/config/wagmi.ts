"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,

} from "@rainbow-me/rainbowkit/wallets";
import { http } from "viem";
import { cookieStorage, createConfig, createStorage } from "wagmi";
import { mainnet } from "wagmi/chains";
import { zilliqa, zilliqaTestnet } from "./chains";

// Get the supported chain ID from environment variable
const supportedChainId = process.env.NEXT_PUBLIC_CHAIN_ID 
  ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) 
  : zilliqa.id; // Default to zilliqa if not specified

// Log the chain ID for debugging
console.log('NEXT_PUBLIC_CHAIN_ID:', process.env.NEXT_PUBLIC_CHAIN_ID);
console.log('Supported Chain ID:', supportedChainId);
console.log('Zilliqa ID:', zilliqa.id);
console.log('Zilliqa Testnet ID:', zilliqaTestnet.id);

// Determine which chain is the supported one
const supportedChain = supportedChainId === zilliqaTestnet.id ? zilliqaTestnet : zilliqa;

// Define our available chains - include both Zilliqa chains
// This ensures RainbowKit knows about both chains but will mark the non-default one as unsupported
const availableChains = [zilliqa];

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: "Sample Site",
    projectId: "98fecff84cceff3d2f37dab2d8c86234",
  }
);

// Configure wagmi
export const config = createConfig({
  connectors,
  // Cast the chains array to satisfy TypeScript
  chains: availableChains as any,
  multiInjectedProviderDiscovery: true,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [zilliqa.id]: http(),
    //[zilliqaTestnet.id]: http(),
  },
});

// Export the supported chain for use in other components
export const defaultChain = supportedChain;