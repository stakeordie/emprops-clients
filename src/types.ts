import { SendTransactionReturnType } from "viem";

export interface SmartContract<T, A> {
  new (provider: T, abi: A, address: string): void;
}
export interface CollectionContract {
  createCollection<T>(params: T): Promise<TransactionResponse>;
  mint<T>(params: T): Promise<TransactionResponse>;
  setStatus<T>(params: T): Promise<TransactionResponse>;
  setPrice<T>(params: T): Promise<TransactionResponse>;
  setEditions<T>(params: T): Promise<TransactionResponse>;
  withdrawFunds<T>(params: T): Promise<TransactionResponse>;
  getRedeemAmount<T>(params: T): Promise<QueryResponse<{ amount: number }>>;
  getCollectionInfo<T>(params: T): Promise<
    QueryResponse<{
      status: CollectionStatus;
      editions: number;
      price: number;
      mintMode: number;
    }>
  >;
  getCollectionConfig<T>(params:T): Promise<
    QueryResponse<{
      maxBatchMintAllowed: number;
      startDate: number;
      endDate: number;
      enableBatchMint: boolean;
    }>>
  getPlatformConfig(): Promise<
    QueryResponse<{
      maxCollectionSize: string;
      minMintPrice: string;
      maxBatchMintSize: string;
    }>
  >;
}

export type TransactionResponse = SendTransactionReturnType 

export interface QueryResponse<T> {
  data: T | null;
  error: Error | null;
}
export type ContractType = "collection" | "token";
export type BlockchainType = "BASE" | "ETHEREUM";
export type VersionType = "v1";
export enum CollectionStatus {
  OFF = 0,
  ON = 1,
}
