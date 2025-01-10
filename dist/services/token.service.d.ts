import { PrismaService } from './prisma.service';
import { PhaseService } from './phase.service';
interface PhaseConfig {
    tokensForPhase: string;
    priceInUsd: string;
    totalTokensForSale: string;
}
export declare class TokenService {
    private prisma;
    private phaseService;
    constructor(prisma: PrismaService, phaseService: PhaseService);
    initializeChainToken(chainId: number, address: string, totalBought: string): Promise<{
        address: string;
        chainId: number;
        id: number;
        totalBought: string;
        lastUpdated: Date;
        phase: number;
    }>;
    recordTradeAndUpdate(chainId: number, user: string, tradeAmount: string, newTotal: string): Promise<{
        chainToken: {
            address: string;
            chainId: number;
            id: number;
            totalBought: string;
            lastUpdated: Date;
            phase: number;
        };
        phase: number;
    }>;
    getCumulativeTotalBought(): Promise<bigint>;
    setLaunchTime(time: Date): Promise<{
        id: number;
        time: Date;
    }>;
    getLaunchTime(): Promise<Date>;
    private getOldPhase;
    calculatePhase(totalBought: string): number;
    private handlePhaseTransition;
    getAllChainsStatus(): Promise<{
        address: string;
        chainId: number;
        totalBought: string;
    }[]>;
    getPhaseConfig(phase: number): PhaseConfig;
}
export {};
