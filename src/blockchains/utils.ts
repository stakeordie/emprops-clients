export const emptyHash =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export function handleTransactionResponse(error: any, transactionHash: string) {
  if (error) {
    return { data: null, error: error };
  } else {
    return {
      data: {
        transactionHash: transactionHash,
      },
      error: null,
    };
  }
}
