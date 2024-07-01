import Web3, { AbiFunctionFragment } from "web3";
import { AbiItem } from "web3-utils";

export function encodeFunctionCall(
  web3: Web3,
  abi: AbiItem[],
  functionName: string,
  args: any[]
): string {
  const method = abi.find(
    (x) => (x as AbiFunctionFragment)?.name === functionName
  );
  if (!method) throw new Error(`Method ${functionName} not found in ABI`);
  if (method.type !== "function")
    throw new Error(`Method ${functionName} is not a function`);
  if (!method.inputs) throw new Error(`Method ${functionName} has no inputs`);
  const types = method.inputs.map((x) => x.type);
  return web3.eth.abi.encodeFunctionCall(
    { name: functionName, type: "function", inputs: method.inputs },
    args
  );
}
