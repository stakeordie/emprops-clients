import { BaseCollectionV1 } from "./blockchains/base/v1";
import { EthereumCollectionV0 } from "./blockchains/ethereum/v0";
import { EthereumCollectionV1 } from "./blockchains/ethereum/v1";
import { BlockchainType, CollectionContract, VersionType } from "./types";
import { WalletClient } from "viem";

export class BaseFactoryContract {
  public createCollectionContract(
    walletProvider: WalletClient,
    version: VersionType,
    address: string,
    abi: any,
    rpcUrl: string,
  ): CollectionContract {
    if (version === "v1") {
      return new BaseCollectionV1(walletProvider, abi, address, rpcUrl, version);
    }
    throw new Error("Invalid BASE contract version");
  }
}

export class EthereumFactoryContract {
  public createCollectionContract(
    walletProvider: WalletClient,
    version: VersionType,
    address: string,
    abi: any,
    rpcUrl: string,
  ): CollectionContract {
    if (version === "v0") {
      return new EthereumCollectionV0(walletProvider, abi, address, rpcUrl, version);
    }
    if (version === "v1") {
      return new EthereumCollectionV1(walletProvider, abi, address, rpcUrl, version);
    }
    throw new Error("Invalid ETHEREUM contract version");
  }
}

export class ContractFactoryFacade {
  public createCollectionContract<T>(
    walletProvider: T,
    blockchain: BlockchainType,
    version: VersionType,
    address: string,
    abi: any,
    rpcUrl: string,
  ): CollectionContract | undefined {
    if (blockchain === "BASE") {
      return new BaseFactoryContract().createCollectionContract(
        walletProvider as WalletClient,
        version,
        address,
        abi,
        rpcUrl,
      );
    }
    if(blockchain === "ETHEREUM") {
      return new EthereumFactoryContract().createCollectionContract(
        walletProvider as WalletClient,
        version,
        address,
        abi,
        rpcUrl,
      )
    }
    return undefined;
  }
}
