import { PhaseConfig } from "src/global.config";
import { PhaseService } from "src/services/phase.service";
import { TokenService } from "src/services/token.service";
export declare class PresaleController {
    private readonly tokenService;
    private readonly phaseService;
    constructor(tokenService: TokenService, phaseService: PhaseService);
    getPhases(): Promise<{
        phases: Record<number, PhaseConfig>;
    }>;
    getPresaleStatus(): Promise<{
        chains: {
            address: string;
            chainId: number;
            totalBought: string;
        }[];
        totalBought: string;
        currentPhase: number;
        priceInUsd: string;
        totalTokensForSale: string;
    }>;
    getPresaleDetails(): Promise<any>;
}
