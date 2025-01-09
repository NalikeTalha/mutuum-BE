import { PhaseConfig } from "src/global.config";
import { TokenService } from "src/services/token.service";
export declare class PresaleController {
    private readonly tokenService;
    constructor(tokenService: TokenService);
    getPhases(): Promise<{
        phases: Record<number, PhaseConfig>;
    }>;
    getPresaleStatus(): Promise<{
        chains: {
            chainId: number;
            address: string;
            totalBought: string;
        }[];
        totalBought: string;
        currentPhase: number;
        priceInUsd: string;
        totalTokensForSale: string;
    }>;
}
