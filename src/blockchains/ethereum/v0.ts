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
} from "../../types";
import { WalletClient, encodeFunctionData } from "viem";
import { getChain } from "@dynamic-labs/utils";
export interface CollectionTransactionEthereumParams
  extends CollectionQueryEthereumParams {}
export interface CollectionQueryEthereumParams {
  collectionId: number;
}
export interface TokensMintedQueryParams extends CollectionQueryEthereumParams {
  address: string;
}
export interface SetStatusParamsEthereumV0 extends CollectionTransactionEthereumParams {
  status: CollectionStatus;
}
export interface SetPriceParamsEthereumV0 extends CollectionTransactionEthereumParams {
  price: string;
}
export interface SetEditionsParamsEthereumV0
  extends CollectionTransactionEthereumParams {
  editions: number;
}

export interface MintParamsEthereumV0 {
  collectionId: number;
  owner: string;
  // Allowlist credentials
  credentials?: {
    proof: string[];
    allowedToMint: number;
  };
  value: string;
}

export interface CreateCollectionParamsEthereumV0 {
  collection: CollectionArgsEthereumV0;
  collectionConfig: CollectionConfigEthereumV0;
  primarySalesReceivers: FundReceiverEthereumV0[];
}

export interface FundReceiverEthereumV0 {
  addr: string;
  rate: number;
}

export interface CollectionConfigEthereumV0 {
  enableBatchMint: boolean;
  maxBatchMintAllowed: number;
  startDate: number;
  endDate: number | null;
}
export enum MintModeEthereumV0 {
  PUBLIC = 0,
  ALLOW_LIST = 1,
  FREE_LIST = 2,
}

export interface CollectionArgsEthereumV0 {
  author: string;
  editions: number;
  freeMinter: string;
  status: CollectionStatus;
  metadata: string;
  mintMode: MintModeEthereumV0;
  tokenContractAddress: string;
  price: string;
  royalty: number;
  allowlist: string;
  freelist: string;
  royaltyAddress: string;
}

export interface RedeemParamsEthereumV0  extends CollectionQueryEthereumParams {
  address: string;
}

export class EthereumCollectionV0 implements CollectionContract {
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

  async createCollection<CreateCollectionParamsEthereumV0>(
    params: CreateCollectionParamsEthereumV0,
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("createCollection", [
      params.collection,
      params.collectionConfig,
      params.primarySalesReceivers,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async mint<MintParamsEthereumV0>(
    params: MintParamsEthereumV0,
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("mint", [
      params.collectionId,
      params.owner,
      params.credentials.proof,
      params.credentials.allowedToMint,
    ]);
    const transaction = await this.buildTransactionData(params.value, args);
    return this.signer.sendTransaction(transaction);
  }

  async setStatus<SetStatusParamsEthereumV0>(
    params: SetStatusParamsEthereumV0,
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("setStatus", [
      params.collectionId,
      params.status,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async setPrice<SetPriceParamsEthereumV0>(
    params: SetPriceParamsEthereumV0,
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("setPrice", [
      params.collectionId,
      params.price,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async setEditions<SetEditionsParamsEthereumV0>(
    params: SetEditionsParamsEthereumV0,
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
    const args = this.encodeFunctionData("setTotalEditions", [
      params.collectionId,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async getRedeemAmount<RedeemParamsEthereumV0>(
    params: RedeemParamsEthereumV0,
  ): Promise<QueryResponse<{ amount: number }>> {
    const fundsCollected = await this.querier.methods
      .fundsCollected(params.collectionId)
      .call();
    return { data: { amount: fundsCollected }, error: null };
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
    return {
      data: {
        maxBatchMintAllowed: 1,
        startDate: 0,
        endDate: 0,
        enableBatchMint: false,
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
    return {
      data: {
        maxBatchMintAllowed: 1,
        startDate: 0,
        endDate: 0,
        enableBatchMint: false,
      },
      error: null,
    };
  }

  async getTokensMinted<TokensMintedQueryParams>(params: TokensMintedQueryParams): Promise<
  QueryResponse<{
    tokensMinted: {
      allowlistCount: number;
      freelistCount: number;  
    };
  }>
> {  

  const tokensMinted: number = await this.querier.methods
    .allowlistCount(params.collectionId, params.address)
    .call();
  
  const response = {
    allowlistCount: tokensMinted || 0,
    freelistCount: 0
  }

  return {
    data: {
      tokensMinted: response,
    },
    error: null,
  };
}
}
