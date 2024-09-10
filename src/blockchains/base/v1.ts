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
import { handleTransactionResponse } from "../utils";
import { WalletClient, encodeFunctionData } from "viem";
import { getChain } from "@dynamic-labs/utils";
export interface CollectionTransactionBaseParams
  extends CollectionQueryBaseParams {}
export interface CollectionQueryBaseParams {
  collectionId: number;
}
export interface TokensMintedQueryParams extends CollectionQueryBaseParams {
  address: string;
}
export interface SetStatusParamsBaseV1 extends CollectionTransactionBaseParams {
  status: CollectionStatus;
}
export interface SetPriceParamsBaseV1 extends CollectionTransactionBaseParams {
  price: string;
}
export interface SetEditionsParamsBaseV1
  extends CollectionTransactionBaseParams {
  editions: number;
}

export interface MintParamsBaseV1 {
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

export interface CreateCollectionParamsBaseV1 {
  collection: CollectionArgsBaseV1;
  collectionConfig: CollectionConfigBaseV1;
  primarySalesReceivers: FundReceiverBaseV1[];
}

export interface FundReceiverBaseV1 {
  addr: string;
  rate: number;
}

export interface CollectionConfigBaseV1 {
  enableBatchMint: boolean;
  maxBatchMintAllowed: number;
  startDate: number;
  endDate: number | null;
}
export enum MintModeBaseV1 {
  PUBLIC = 0,
  ALLOW_LIST = 1,
  FREE_LIST = 2,
}

export interface CollectionArgsBaseV1 {
  author: string;
  editions: number;
  freeMinter: string;
  status: CollectionStatus;
  metadata: string;
  mintMode: MintModeBaseV1;
  tokenContractAddress: string;
  price: string;
  royalty: number;
  allowlist: string;
  freelist: string;
  royaltyAddress: string;
}

export class BaseCollectionV1 implements CollectionContract {
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

  async createCollection<CreateCollectionParamsBaseV1>(
    params: CreateCollectionParamsBaseV1
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("createCollection", [
      params.collection,
      params.collectionConfig,
      params.primarySalesReceivers,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async mint<MintParamsBaseV1>(
    params: MintParamsBaseV1
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

  async setStatus<SetStatusParamsBaseV1>(
    params: SetStatusParamsBaseV1
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("setStatus", [
      params.collectionId,
      params.status,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async setPrice<SetPriceParamsBaseV1>(
    params: SetPriceParamsBaseV1
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("setPrice", [
      params.collectionId,
      params.price,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async setEditions<SetEditionsParamsBaseV1>(
    params: SetEditionsParamsBaseV1
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("setTotalEditions", [
      params.collectionId,
      params.editions,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async withdrawFunds<CollectionTransactionBaseParams>(
    params: CollectionTransactionBaseParams
  ): Promise<TransactionResponse> {
    const args = this.encodeFunctionData("withdrawFunds", [
      params.collectionId,
    ]);
    const transaction = await this.buildTransactionData("0", args);
    return this.signer.sendTransaction(transaction);
  }

  async getRedeemAmount<RedeemParamsBaseV1>(
    params: RedeemParamsBaseV1
  ): Promise<QueryResponse<{ amount: number }>> {
    const account = await this.querier.methods
      .accounts(params.collectionId, params.address)
      .call();
    if (!account) return { data: null, error: new Error("Account not found") };
    const fundsCollected = await this.querier.methods
      .fundsCollected(params.collectionId)
      .call();
    const availableToRedeem = Number(
      (account.rate / 10000) * fundsCollected - account.fundsClaimed
    );
    return { data: { amount: availableToRedeem }, error: null };
  }

  async getCollectionInfo<CollectionQueryBaseParams>(
    params: CollectionQueryBaseParams
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

  async getCollectionConfig<CollectionQueryBaseParams>(
    params: CollectionQueryBaseParams
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

  async getTokensMinted<TokensMintedQueryParams>(params: TokensMintedQueryParams): Promise<
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
