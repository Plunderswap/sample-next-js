import { Address } from "viem";
import { zilliqa, zilliqaTestnet } from "./chains";

type AddressMap = Record<number, Address>;

export const CONTRACTS: Record<string, AddressMap> = {
  L2_RESOLVER_ADDR: {
    [zilliqa.id]: "0x5c0c7BFd25efCAE366fE62219fD5558305Ffc46F",
    [zilliqaTestnet.id]: "0x579C72c5377a5a4A8Ce6d43A1701F389c8FDFC8e",
  },
};

export const nodeEnv = process.env.NODE_ENV;
export const isDevelopment = nodeEnv === "development";