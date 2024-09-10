// Ignore linter in all file
/* eslint-disable */
// Ignore ts in all  file
// @ts-nocheck
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import {
  CollectionContract,
  CollectionStatus,
  QueryResponse,
  TransactionResponse,
} from "../types";
import { WalletClient, encodeFunctionData } from "viem";
import { getChain } from "@dynamic-labs/utils";
export interface CollectionTransactionEthereumParams
  extends CollectionQueryEthereumParams {}
export interface CollectionQueryEthereumParams {
  collectionId: number;
}

export interface TokensMintedQueryEthereumParamsV1 extends CollectionQueryEthereumParams {
  address: string;
}
export interface SetStatusParamsEthereumV1 extends CollectionTransactionEthereumParams {
  status: CollectionStatus;
}
export interface SetPriceParamsEthereumV1 extends CollectionTransactionEthereumParams {
  price: string;
}
export interface SetEditionsParamsEthereumV1
  extends CollectionTransactionEthereumParams {
  editions: number;
}

export interface MintParamsEthereumV1 {
  collectionId: number;
  owner: string;
  quantity: number;
  // Allowlist credentials
  credentials?: {
    proof: string[];
    allowedToMint: number;
  };
  value: string;
}

export interface CreateCollectionParamsEthereumV1 {
  collection: CollectionArgsEthereumV1;
  collectionConfig: CollectionConfigEthereumV1;
  primarySalesReceivers: FundReceiverEthereumV1[];
}

export interface FundReceiverEthereumV1 {
  addr: string;
  rate: number;
}

export interface CollectionConfigEthereumV1 {
  enableBatchMint: boolean;
  maxBatchMintAllowed: number;
  startDate: number;
  endDate: number | null;
}
export enum MintModeEthereumV1 {
  PUBLIC = 0,
  ALLOW_LIST = 1,
  FREE_LIST = 2,
}

export interface CollectionArgsEthereumV1 {
  author: string;
  editions: number;
  freeMinter: string;
  status: CollectionStatus;
  metadata: string;
  mintMode: MintModeEthereumV1;
  tokenContractAddress: string;
  price: string;
  royalty: number;
  allowlist: string;
  freelist: string;
  royaltyAddress: string;
}

export interface RedeemParamsEthereumV1  extends CollectionQueryEthereumParams {
  address: string;
}

export class EthereumCollectionV1 implements CollectionContract {
  querier;
  constructor(
    private signer: WalletClient,
    private abi: AbiItem[] | AbiItem,
    private address: string,
    rpcUrl: string,
    private version: string,
  ) {
    const web3 = new Web3(rpcUrl);
    this.querier = new web3.eth.Contract(this.abi, address);
  }
  private async buildTransactionData(value: string, data: string) {
    const from = this.getAccount();
    return {
      account: from,
      chain: getChain(await this.signer.getChainId()),
      to: this.address,
      value,
      data,
    };
  }

  private encodeFunctionData(functionName: string, args: any[]) {
    return encodeFunctionData({
      abi: this.abi,
      functionName,
      args,
    });
  }

  private getAccount(): string {
    const account = this.signer.account?.address;
    if (!account) throw new Error("Account not found");
    return account;
  }

  async createCollection<CreateCollectionParamsEthereumV1>(
    params: CreateCollectionParamsEthereumV1,
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("createCollection", [
      params.collection,
      params.collectionConfig,
      params.primarySalesReceivers,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async mint<MintParamsEthereumV1>(
    params: MintParamsEthereumV1,
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("mint", [
      params.collectionId,
      params.owner,
      params.credentials.proof,
      params.quantity,
      params.credentials.allowedToMint,
    ]);
    const transaction = await this.buildTransactionData(params.value, args);
    return this.signer.sendTransaction(transaction);
  }

  async setStatus<SetStatusParamsEthereumV1>(
    params: SetStatusParamsEthereumV1,
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("setStatus", [
      params.collectionId,
      params.status,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async setPrice<SetPriceParamsEthereumV1>(
    params: SetPriceParamsEthereumV1,
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("setPrice", [
      params.collectionId,
      params.price,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async setEditions<SetEditionsParamsEthereumV1>(
    params: SetEditionsParamsEthereumV1,
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("setTotalEditions", [
      params.collectionId,
      params.editions,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async withdrawFunds<CollectionTransactionEthereumParams>(
    params: CollectionTransactionEthereumParams,
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("withdrawFunds", [
      params.collectionId,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async getRedeemAmount<RedeemParamsEthereumV1>(
    params: RedeemParamsEthereumV1,
  ): Promise<QueryResponse<{ amount: number }>> {
    const account = await this.querier.methods
      .accounts(params.collectionId, params.address)
      .call();
    if (!account) return { data: null, error: new Error("Account not found") };
    const fundsCollected = await this.querier.methods
      .fundsCollected(params.collectionId)
      .call();
    const availableToRedeem = Number(
      (account.rate / 10000) * fundsCollected - account.fundsClaimed,
    );
    return { data: { amount: availableToRedeem }, error: null };
  }

  async getCollectionInfo<CollectionQueryEthereumParams>(
    params: CollectionQueryEthereumParams,
  ): Promise<
    QueryResponse<{
      status: CollectionStatus;
      editions: number;
      price: number;
      mintMode: number;
    }>
  > {
    const collection = await this.querier.methods
      .collections(params.collectionId)
      .call();
    return {
      data: {
        status: Number(collection.status),
        editions: Number(collection.editions),
        price: Number(collection.price),
        mintMode: Number(collection.mintMode),
      },
      error: null,
    };
  }

  async getCollectionConfig<CollectionQueryEthereumParams>(
    params: CollectionQueryEthereumParams,
  ): Promise<
    QueryResponse<{
      maxBatchMintAllowed: number;
      startDate: number;
      endDate: number;
      enableBatchMint: boolean;
    }>
  > {
    const config = await this.querier.methods
      .collectionsConfig(params.collectionId)
      .call();
    if (!config)
      return {
        data: null,
        error: new Error("Collection config not found"),
      };
    const maxBatchMintAllowed = Number(config?.maxBatchMintAllowed);
    const enableBatchMint =
      typeof config?.enableBatchMint === "undefined"
        ? maxBatchMintAllowed > 1
        : config?.enableBatchMint;
    return {
      data: {
        maxBatchMintAllowed,
        startDate: Number(config?.startDate),
        endDate: Number(config?.endDate),
        enableBatchMint,
      },
      error: null,
    };
  }

  async getPlatformConfig(): Promise<
    QueryResponse<{
      maxCollectionSize: string;
      minMintPrice: string;
      maxBatchMintSize: string;
    }>
  > {
    const config = await this.querier.methods.platformConfig().call();
    if (!config)
      return {
        data: null,
        error: new Error("Platform config not found"),
      };
    return {
      data: {
        maxCollectionSize: config.maxCollectionSize.toString(),
        minMintPrice: config.minMintPrice.toString(),
        maxBatchMintSize: config.maxBatchMintSize.toString(),
      },
      error: null,
    };
  }
  async getTokensMinted<TokensMintedQueryEthereumParamsV1>(params: TokensMintedQueryEthereumParamsV1): Promise<
    QueryResponse<{
      tokensMinted: {
        allowlistCount: number;
        freelistCount: number;
      };
    }>
  > {

    const tokensMinted = await this.querier.methods
      .accounts(params.collectionId, params.address)
      .call();

    const response = {
      allowlistCount: Number(tokensMinted?.allowlistCount) || 0,
      freelistCount: 0
    }

    return {
      data: {
        tokensMinted: response
      },
      error: null,
    };
  }
}
