export interface ChainConfig {
    chainId: number;
    rpcUrl: string;
    contractAddress: string;
}
export declare const CHAIN_CONFIGS_DEV: ChainConfig[];
export declare const CHAIN_CONFIGS_PROD: ChainConfig[];
export declare const CHAIN_CONFIGS: ChainConfig[];
export interface PhaseConfig {
    tokensForPhase: string;
    priceInUsd: string;
    totalTokensForSale: string;
}
export declare const PHASES: Record<number, PhaseConfig>;
