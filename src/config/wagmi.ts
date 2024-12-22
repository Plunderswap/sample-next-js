"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http } from "viem";
import { cookieStorage, createConfig, createStorage } from "wagmi";
import { zilliqa, zilliqaTestnet } from "./chains";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
        rainbowWallet,
      ],
    },
  ],
  {
    // TODO: Update app name and project id from walletconnect dashboard
    appName: "YOU APP NAME HERE",
    projectId: "YOUR PROJECT ID HERE",
  }
);

export const config = createConfig({
  connectors,
  chains: [zilliqa, zilliqaTestnet],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [zilliqa.id]: http(),
    [zilliqaTestnet.id]: http(),
  },
});