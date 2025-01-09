import { ethers, parseUnits } from "ethers";

export interface ChainConfig {
    chainId: number;
    rpcUrl: string;
    contractAddress: string;
}

export const CHAIN_CONFIGS_DEV: ChainConfig[] = [
    {
        //bsc testnet
        "chainId": 97,
        "rpcUrl": "https://bsc-testnet.infura.io/v3/5c56ff0214024df5b78ae32961014217",
        "contractAddress": "0x2f38323d899751323C04145B05d5FefC513b1519"
    },
    {
        // eth sepolia
        "chainId": 11155111,
        "rpcUrl": "https://sepolia.infura.io/v3/5c56ff0214024df5b78ae32961014217",
        "contractAddress": "0xeEAB23d916dA13CcB30fDB494a85c12638CFbB9B"
    },
    {
        // base sepolia
        "chainId": 84532,
        "rpcUrl": "https://base-sepolia-rpc.publicnode.com",
        "contractAddress": "0x89de37f99a0ea5a6594eda4ee567d97e1b8111d9"
    }
]


export const CHAIN_CONFIGS_PROD: ChainConfig[] = [
    {
        //bsc mainnet
        "chainId": 56,
        "rpcUrl": "https://binance.llamarpc.com",
        "contractAddress": "0x2f38323d899751323C04145B05d5FefC513b1519"
    },
    {
        // eth mainnet
        "chainId": 1,
        "rpcUrl": "https://eth.meowrpc.com",
        "contractAddress": "0xeEAB23d916dA13CcB30fDB494a85c12638CFbB9B"
    },
    {
        // polygon mainnet
        "chainId": 137,
        "rpcUrl": "https://polygon.llamarpc.com",
        "contractAddress": "0x89de37f99a0ea5a6594eda4ee567d97e1b8111d9"
    }
]

console.log('process.env.IS_LIVE',process.env.IS_LIVE);
export const CHAIN_CONFIGS = process.env.IS_LIVE == 'true'  ? CHAIN_CONFIGS_PROD : CHAIN_CONFIGS_DEV;

export interface PhaseConfig {
    tokensForPhase: string;     // Amount after which phase changes
    priceInUsd: string;
    totalTokensForSale: string;
}

export const PHASES: Record<number, PhaseConfig> = {
    1: {
        tokensForPhase: '120000000000000000000000',
        priceInUsd: '1000000000000000',
        totalTokensForSale: '1000000000000000000000000000'
    },
    2: {
        tokensForPhase: '240000000000000000000000',
        priceInUsd: '2000000000000000',
        totalTokensForSale: '2000000000000000000000000000'
    },
    3: {
        tokensForPhase: '360000000000000000000000',
        priceInUsd: '3000000000000000',
        totalTokensForSale: '3000000000000000000000000000'
    },
    4: {
        tokensForPhase: '480000000000000000000000',
        priceInUsd: '4000000000000000',
        totalTokensForSale: '4000000000000000000000000000'
    },
};