import { defineChain } from "viem";

export const zilliqa = defineChain({
  id: 32769,
  name: "Zilliqa",
  iconUrl: "https://plunderswap.com/images/chains/33101.png",
  nativeCurrency: { name: "Zilliqa", symbol: "ZIL", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.zilliqa.com/"] },
  },
  blockExplorers: {
    default: { name: "Otterscan", url: "https://otterscan.zilliqa.com" },
  },
  contracts: {
    ensUniversalResolver: {
      address: "0xe32A0F3e3787B535719e8949Eb065F675eB96D25",
    },
    ensRegistry: {
      address: "0x2196b67Ca97bBcA07C01c7Bdf4f35209CC615389",
    },
    multicall3: {
      address: "0x38899efb93d5106d3adb86662c557f237f6ecf57",
      blockCreated: 5313022,
    },
  },
});

export const zilliqaTestnet = defineChain({
  id: 33101,
  name: "Zilliqa Testnet",
  iconUrl: "https://plunderswap.com/images/chains/33101.png",
  nativeCurrency: { name: "Zilliqa", symbol: "ZIL", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.testnet.zilliqa.com/"] },
  },
  blockExplorers: {
    default: {
      name: "Otterscan",
      url: "https://otterscan.testnet.zilliqa.com",
    },
  },
  contracts: {
    ensUniversalResolver: {
      address: "0x579C72c5377a5a4A8Ce6d43A1701F389c8FDFC8e",
    },
    ensRegistry: {
      address: "0x716c7e7dC02f7E0FD44343C720233DB57896Fb1b",
    },
    multicall3: {
      address: "0x3c2ffc98284b2f6e1035eaeed75e9273b5b63223",
      blockCreated: 3251173,
    },
  },
});