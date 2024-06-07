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
    }>
  >;
  getPlatformConfig(): Promise<
    QueryResponse<{
      maxCollectionSize: number;
      minMintPrice: number;
      maxBatchMintSize: number;
    }>
  >;
}

export interface TransactionResponse {
  data: {
    transactionHash: string;
  };
  error: Error | null;
}
export interface QueryResponse<T> {
  data: T | null;
  error: Error | null;
}
export type ContractType = "collection" | "token";
export type BlockchainType = "BASE";
export type VersionType = "v1";
export enum CollectionStatus {
  OFF = 0,
  ON = 1,
}
