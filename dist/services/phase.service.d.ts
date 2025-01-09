import { OnModuleInit } from "@nestjs/common";
export declare class PhaseService implements OnModuleInit {
    private contracts;
    private wallets;
    onModuleInit(): Promise<void>;
    setSaleParamsAllChains(priceInUsd: string, totalTokensForSale: string): Promise<void>;
}
