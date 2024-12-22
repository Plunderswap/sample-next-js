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
    appName: "Zilnames",
    projectId: "9d186193dfaff4c4e4c827ab98d36580",
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