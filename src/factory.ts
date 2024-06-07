import Web3 from "web3";
import { BaseCollectionV1 } from "./blockchains/base/v1";
import { BlockchainType, CollectionContract, VersionType } from "./types";

export class BaseFactoryContract {
  public createCollectionContract(
    walletProvider: Web3,
    version: VersionType,
    address: string,
    abi: any,
    rpcUrl?: string,
  ): CollectionContract {
    if (version === "v1") {
      return new BaseCollectionV1(walletProvider, abi, address, rpcUrl);
    }
    throw new Error("Invalid BASE contract version");
  }
}

export class ContractFactoryFacade {
  public createCollectionContract<T>(
    walletProvider: T,
    blockchain: BlockchainType,
    version: VersionType,
    address: string,
    abi: any,
    rpcUrl?: string,
  ): CollectionContract | undefined {
    if (blockchain === "BASE") {
      return new BaseFactoryContract().createCollectionContract(
        walletProvider as Web3,
        version,
        address,
        abi,
        rpcUrl,
      );
    }
    return undefined;
  }
}
