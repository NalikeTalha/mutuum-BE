import { OnModuleInit } from "@nestjs/common";
export declare class PhaseService implements OnModuleInit {
    private contracts;
    private wallets;
    onModuleInit(): Promise<void>;
    setSaleParamsAllChains(priceInUsd: string): Promise<void>;
    getTotalBuyersAllChains(): Promise<number>;
    getIsLiveAllChains(): Promise<boolean>;
    getLatestSold(): Promise<any>;
    getNativePrices(priceInUsd: number): Promise<any>;
}
