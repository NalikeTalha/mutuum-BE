import { ethers, parseUnits } from "ethers";

export interface ChainConfig {
    chainId: number;
    rpcUrl: string;
    contractAddress: string;
}

export const CHAIN_CONFIGS: ChainConfig[] = [
    {
        //bsc testnet
        "chainId": 97,
        "rpcUrl": "https://bsc-testnet.infura.io/v3/5c56ff0214024df5b78ae32961014217",
        "contractAddress": "0x38b20884a6B3039CA71bEfF62CA30494e369b58c"
    },
    {
        // eth sepolia
        "chainId": 11155111,
        "rpcUrl": "https://sepolia.infura.io/v3/5c56ff0214024df5b78ae32961014217",
        "contractAddress": "0x9c3fc9e4A460171aD713d6Ff6156C853997EDa1c"
    }
]

export interface PhaseConfig {
    tokensForPhase: string;     // Amount after which phase changes
    priceInUsd: string;
    totalTokensForSale: string;
}

export const PHASES: Record<number, PhaseConfig> = {
    1: {
        tokensForPhase: '120000000000000005462189',
        priceInUsd: '1000000000000000',
        totalTokensForSale: '31000000000000000000000000000'
    },
    2: {
        tokensForPhase: '120000000000000005480000',
        priceInUsd: '1000000000000001',
        totalTokensForSale: '32000000000000000000000000001'
    },
    3: {
        tokensForPhase: '120000000000000005500000',
        priceInUsd: '1000000000000002',
        totalTokensForSale: '330000000000000000000000000002'
    }
};