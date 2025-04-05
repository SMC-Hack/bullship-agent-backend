export const AgentMerchant = {
  abi: [
    {
      inputs: [
        {
          internalType: 'address',
          name: '_usdcTokenAddress',
          type: 'address',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'walletAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'creatorAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'stockTokenAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'string',
          name: 'name',
          type: 'string',
        },
        {
          indexed: false,
          internalType: 'string',
          name: 'symbol',
          type: 'string',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'initialPrice',
          type: 'uint256',
        },
      ],
      name: 'AgentCreated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'agentWalletAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'oldPricePerToken',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newPricePerToken',
          type: 'uint256',
        },
      ],
      name: 'PricePerTokenUpdated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'agentWalletAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'stockTokenAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'totalTokenAmount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'newPricePerToken',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'totalUsdcPaid',
          type: 'uint256',
        },
      ],
      name: 'SellRequestFulfilled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'seller',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'stockTokenAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'tokenAmount',
          type: 'uint256',
        },
      ],
      name: 'SellStockRequested',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'buyer',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'agentWalletAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'stockTokenAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'tokenAmount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'usdcAmount',
          type: 'uint256',
        },
      ],
      name: 'StockPurchased',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'oldAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newAddress',
          type: 'address',
        },
      ],
      name: 'UsdcTokenAddressUpdated',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'agentInfoMapper',
      outputs: [
        {
          internalType: 'address',
          name: 'walletAddress',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'stockTokenAddress',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'pricePerToken',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'creatorAddress',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'stockTokenAddress',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenAmount',
          type: 'uint256',
        },
      ],
      name: 'commitSellStock',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'walletAddress',
          type: 'address',
        },
        {
          internalType: 'string',
          name: 'name',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'symbol',
          type: 'string',
        },
      ],
      name: 'createAgent',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      name: 'creatorAddressToAgentWalletAddressesMapper',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'fullfillSellStock',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'stockTokenAddress',
          type: 'address',
        },
      ],
      name: 'getSellShareRequestsLength',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'stockTokenAddress',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenAmount',
          type: 'uint256',
        },
      ],
      name: 'purchaseStock',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'stockTokenAddress',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'usdcAmount',
          type: 'uint256',
        },
      ],
      name: 'purchaseStockByUsdc',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      name: 'sellShareRequests',
      outputs: [
        {
          internalType: 'address',
          name: 'userWalletAddress',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenAmount',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'stockTokenToWalletAddressMapper',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_usdcTokenAddress',
          type: 'address',
        },
      ],
      name: 'updateUsdcTokenAddress',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'usdcToken',
      outputs: [
        {
          internalType: 'contract IERC20',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],
};
