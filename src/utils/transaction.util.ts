import { ethers } from 'ethers';

export function logTransaction(
  tx: ethers.ContractTransactionResponse | ethers.TransactionResponse,
  chainName: string,
  action: string,
) {
  console.log(`\n[${chainName}] Transaction sent for ${action}:`);
  console.log(`Hash: ${tx.hash}`);
  console.log(`From: ${tx.from}`);
  console.log(`To: ${tx.to || 'Contract Creation'}`);
  console.log(`Value: ${ethers.formatEther(tx.value || 0)} ETH`);
  console.log(`Gas Limit: ${tx.gasLimit?.toString()}`);
  console.log(`Nonce: ${tx.nonce}\n`);
}
