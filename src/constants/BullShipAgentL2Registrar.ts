import { ContractInterface } from 'ethers';

export interface BullShipAgentRegistrarContract {
  abi: ContractInterface;
}

export const BullShipAgentL2Registrar = {
  abi: [
    {
      inputs: [
        { internalType: 'string', name: 'label', type: 'string' },
        { internalType: 'address', name: 'owner', type: 'address' },
      ],
      name: 'register',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'string', name: 'label', type: 'string' }],
      name: 'available',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'admin',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'chainId',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'coinType',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'registry',
      outputs: [
        {
          internalType: 'contract IL2Registry',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],
};
