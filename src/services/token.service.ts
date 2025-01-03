import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PHASES } from 'src/global.config';
import { PhaseService } from './phase.service';

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

            // Calculate cumulative including current update
            const allChainTokens = await tx.chainToken.findMany({
                select: { totalBought: true, chainId: true }
            });

            const cumulativeTotal = allChainTokens.reduce((sum, token) => {
                const amount = token.chainId === chainId ? newTotal : token.totalBought;
                return sum + BigInt(amount);
            }, BigInt(0));

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

    // async recordTradeAndUpdate(chainId: number, user: string, tradeAmount: string, newTotal: string) {
    //     // First transaction: Update single chain data
    //     const chainToken = await this.prisma.$transaction(async (tx) => {
    //         const existingToken = await tx.chainToken.findFirst({ where: { chainId } });
    //         if (!existingToken) throw new Error(`No token found for chain ${chainId}`);

    //         const chainToken = await tx.chainToken.update({
    //             where: { chainId_address: { chainId, address: existingToken.address } },
    //             data: { totalBought: newTotal, lastUpdated: new Date() }
    //         });

    //         await tx.trade.create({
    //             data: { chainTokenId: chainToken.id, user, amount: tradeAmount }
    //         });

    //         return chainToken;
    //     });

    //     // Second transaction: Handle phase update
    //     const cumulativeTotal = await this.getCumulativeTotalBought();


    //     const newPhase = this.calculatePhase(cumulativeTotal.toString());
    //     console.log('cumulativeTotal', cumulativeTotal)
    //     console.log('newPhase', newPhase)

    //     if (newPhase > chainToken.phase) {
    //         console.log('changing phase')
    //         await this.handlePhaseTransition(newPhase, chainToken.address);
    //         await this.prisma.chainToken.updateMany({
    //             data: { phase: newPhase }
    //         });
    //     }

    //     return chainToken;
    // }

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

    private calculatePhase(totalBought: string): number {
        let phase = 1;
        const total = BigInt(totalBought);

        for (const [p, config] of Object.entries(PHASES)) {
            if (total < BigInt(config.tokensForPhase)) {
                break;
            }
            phase = Number(p);
        }

        console.log('phase', phase)
        console.log('PHASES[phase]', PHASES[phase])
        console.log('totalBought', totalBought)
        return phase;
    }

    private async handlePhaseTransition(phase: number, address: string) {
        const phaseConfig = PHASES[phase];

        try {
            console.log('handling phase transition')
            console.log('phaseConfig', phaseConfig)
            await this.phaseService.setSaleParamsAllChains(
                phaseConfig.priceInUsd,
                phaseConfig.totalTokensForSale
            );
        } catch (error) {
            console.error(`Failed to handle phase transition to phase ${phase}:`, error);
        }
    }

}