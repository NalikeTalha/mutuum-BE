import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PHASES } from 'src/global.config';
import { PhaseService } from './phase.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { parseEther } from 'ethers';

interface PhaseConfig {
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
        const chainDetails = await this.prisma.chainToken.findFirst({ where: { chainId } });
        if (chainDetails) {
            return await this.prisma.chainToken.update({
                where: { chainId },
                data: { totalBought, phase, address }
            });
        }else{
            return this.prisma.chainToken.create({
                    data: {
                        chainId,
                        address,
                        totalBought,
                        phase
                    }
                });
        }

    }

    async getUniqueWallets(): Promise<number> {
        try {
            const users =  await this.prisma.trade.findMany({
                distinct: ['user']
            });
            return users.length;
        } catch (error) {
            console.log('error', error)
            return 0
        }
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
                console.log('Phase transition detected:', chainToken.phase, '->', newPhase);
                await this.handlePhaseTransition(newPhase, chainToken.address);
                await tx.chainToken.updateMany({
                    data: { phase: newPhase }
                });
            }

            return { chainToken, phase: newPhase };
        }, { timeout:30000 });

        return chainToken;
    }

    async updateMultipleDBSupplies(supplyData: Record<number, string>) {
        for (const [chainId, totalSold] of Object.entries(supplyData)) {
            await this.updateDBSupply({ chainId: Number(chainId), totalSold });
        }
        const result = await this.prisma.$queryRaw
            `SELECT SUM(CAST("totalBought" AS NUMERIC)) AS "sumTotalBought"
                  FROM "ChainToken"`;
        ;
        const cumulativeTotal = result[0].sumTotalBought

        const newPhase = this.calculatePhase(cumulativeTotal.toString());

        const chainToken = await this.prisma.chainToken.findFirst();
        if (chainToken && newPhase > chainToken.phase) {
            console.log('Phase transition detected:', chainToken.phase, '->', newPhase);
            await this.handlePhaseTransition(newPhase, chainToken.address);
            await this.prisma.chainToken.updateMany({
                data: { phase: newPhase }
            });
        }

        return { chainToken, phase: newPhase };
    }

    async updateDBSupply({ chainId, totalSold }: { chainId: number; totalSold: string }) {
        return await this.prisma.chainToken.update({
            where: { chainId },
            data: { totalBought: totalSold }
        });
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

    async setLaunchTime(time: Date) {
        // Check if a LaunchTime record already exists
        const existingLaunchTime = await this.prisma.launchTime.findFirst();

        if (existingLaunchTime) {
            // Update the existing record
            return await this.prisma.launchTime.update({
                where: { id: existingLaunchTime.id },
                data: { time },
            });
        } else {
            // Create a new record
            return await this.prisma.launchTime.create({
                data: { time },
            });
        }
    }

    async getLaunchTime() {
        const launchTime = await this.prisma.launchTime.findFirst();
        if (launchTime) {
            return launchTime.time
        }
        return null;
    }

    public getTokenForNextPhase(phase: number):string {
        let tokenForNextPhase = Number(PHASES[1].totalTokensForSale);
        for (let i = 2; i <= phase; i++) {
            tokenForNextPhase += Number(PHASES[i].totalTokensForSale);
        }
        return tokenForNextPhase.toLocaleString('fullwide', { useGrouping: false });
    }


    private async getOldPhase(chainTokenId: number) {
        const oldRecord = await this.prisma.chainToken.findUnique({
            where: { id: chainTokenId }
        });
        return oldRecord?.phase || 1;
    }

    public calculatePhase(totalBought: string): number {
        let phase = 1;
        const total = BigInt(Number(totalBought).toLocaleString('fullwide', { useGrouping: false }));
        for (const [p, config] of Object.entries(PHASES)) {
            phase = Number(p);
            const tokenForNextPhase = this.getTokenForNextPhase(phase);
            if (total < BigInt(Number(tokenForNextPhase)- (Number(parseEther("20"))))) {
                break;
            }
            
        }
        return phase;
    }

    private async handlePhaseTransition(phase: number, address: string) {
        const phaseConfig = PHASES[phase];

        try {
            await this.phaseService.setSaleParamsAllChains(
                phaseConfig.priceInUsd
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

    // @Cron('*/30 * * * * *')
    // async handleCron() {
    //     console.log('Running cron job every 30 seconds');
    //     try {
    //         const totalSoldArray = await this.phaseService.getLatestSold();
    //         await this.updateMultipleDBSupplies(totalSoldArray);
    //     } catch (error) {
    //         console.error('Error in cron job:', error);
    //     }
    // }

}