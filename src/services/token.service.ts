import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PHASES } from 'src/global.config';
import { PhaseService } from './phase.service';

interface PhaseConfig {
    tokensForPhase: string;
    priceInUsd: string;
    totalTokensForSale: string;
}

@Injectable()
export class TokenService {
    constructor(
        private prisma: PrismaService,
        private phaseService: PhaseService,
    ) { }

    async initializeChainToken(chainId: number, address: string, totalBought: string) {
        const phase = this.calculatePhase(totalBought);
        return this.prisma.chainToken.upsert({
            where: { chainId_address: { chainId, address } },
            create: {
                chainId,
                address,
                totalBought,
                phase
            },
            update: {
                totalBought,
                phase
            }
        });
    }
    
    async recordTradeAndUpdate(chainId: number, user: string, tradeAmount: string, newTotal: string) {
        const chainToken = await this.prisma.$transaction(async (tx) => {
            const existingToken = await tx.chainToken.findFirst({ where: { chainId } });
            if (!existingToken) throw new Error(`No token found for chain ${chainId}`);

            const chainToken = await tx.chainToken.update({
                where: { chainId_address: { chainId, address: existingToken.address } },
                data: { totalBought: newTotal, lastUpdated: new Date() }
            });

            await tx.trade.create({
                data: { chainTokenId: chainToken.id, user, amount: tradeAmount }
            });

            const result = await tx.$queryRaw
                `SELECT SUM(CAST("totalBought" AS NUMERIC)) AS "sumTotalBought"
                  FROM "ChainToken"`;
            ;
            const cumulativeTotal = result[0].sumTotalBought

            const newPhase = this.calculatePhase(cumulativeTotal.toString());

            if (newPhase > chainToken.phase) {
                await this.handlePhaseTransition(newPhase, chainToken.address);
                await tx.chainToken.updateMany({
                    data: { phase: newPhase }
                });
            }

            return { chainToken, phase: newPhase };
        });

        return chainToken;
    }

    async getCumulativeTotalBought(): Promise<bigint> {
        const chainTokens = await this.prisma.chainToken.findMany({
            select: { totalBought: true }
        });

        return chainTokens.reduce((sum, token) =>
            sum + BigInt(token.totalBought),
            BigInt(0)
        );
    }


    private async getOldPhase(chainTokenId: number) {
        const oldRecord = await this.prisma.chainToken.findUnique({
            where: { id: chainTokenId }
        });
        return oldRecord?.phase || 1;
    }

    public calculatePhase(totalBought: string): number {
        let phase = 1;
        const total = BigInt(totalBought);

        for (const [p, config] of Object.entries(PHASES)) {
            if (total < BigInt(config.tokensForPhase)) {
                break;
            }
            phase = Number(p);
        }

        return phase;
    }

    private async handlePhaseTransition(phase: number, address: string) {
        const phaseConfig = PHASES[phase];

        try {
            await this.phaseService.setSaleParamsAllChains(
                phaseConfig.priceInUsd,
                phaseConfig.totalTokensForSale
            );
        } catch (error) {
            console.error(`Failed to handle phase transition to phase ${phase}:`, error);
        }
    }


    async getAllChainsStatus() {
        try {
            // Get all chain tokens from database
            const chainTokens = await this.prisma.chainToken.findMany({
                select: {
                    chainId: true,
                    address: true,
                    totalBought: true
                }
            });

            return chainTokens;
        } catch (error) {
            console.error('Error getting chain status:', error);
            throw error;
        }
    }

    getPhaseConfig(phase: number): PhaseConfig {
        // Get phase config or return first phase if not found
        const phaseConfig = PHASES[phase];
        if (!phaseConfig) {
            console.warn(`Phase ${phase} config not found, using phase 1`);
            return PHASES[1];
        }
        return phaseConfig;
    }

}