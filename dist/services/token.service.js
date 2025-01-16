"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const global_config_1 = require("../global.config");
const phase_service_1 = require("./phase.service");
const ethers_1 = require("ethers");
let TokenService = class TokenService {
    constructor(prisma, phaseService) {
        this.prisma = prisma;
        this.phaseService = phaseService;
    }
    async initializeChainToken(chainId, address, totalBought) {
        const phase = this.calculatePhase(totalBought);
        const chainDetails = await this.prisma.chainToken.findFirst({ where: { chainId } });
        if (chainDetails) {
            return await this.prisma.chainToken.update({
                where: { chainId },
                data: { totalBought, phase, address }
            });
        }
        else {
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
    async recordTradeAndUpdate(chainId, user, tradeAmount, newTotal) {
        const chainToken = await this.prisma.$transaction(async (tx) => {
            const existingToken = await tx.chainToken.findFirst({ where: { chainId } });
            if (!existingToken)
                throw new Error(`No token found for chain ${chainId}`);
            const chainToken = await tx.chainToken.update({
                where: { chainId_address: { chainId, address: existingToken.address } },
                data: { totalBought: newTotal, lastUpdated: new Date() }
            });
            await tx.trade.create({
                data: { chainTokenId: chainToken.id, user, amount: tradeAmount }
            });
            const result = await tx.$queryRaw `SELECT SUM(CAST("totalBought" AS NUMERIC)) AS "sumTotalBought"
                  FROM "ChainToken"`;
            ;
            const cumulativeTotal = result[0].sumTotalBought;
            const newPhase = this.calculatePhase(cumulativeTotal.toString());
            if (newPhase > chainToken.phase) {
                console.log('Phase transition detected:', chainToken.phase, '->', newPhase);
                await this.handlePhaseTransition(newPhase, chainToken.address);
                await tx.chainToken.updateMany({
                    data: { phase: newPhase }
                });
            }
            return { chainToken, phase: newPhase };
        }, { timeout: 30000 });
        return chainToken;
    }
    async updateMultipleDBSupplies(supplyData) {
        for (const [chainId, totalSold] of Object.entries(supplyData)) {
            await this.updateDBSupply({ chainId: Number(chainId), totalSold });
        }
        const result = await this.prisma.$queryRaw `SELECT SUM(CAST("totalBought" AS NUMERIC)) AS "sumTotalBought"
                  FROM "ChainToken"`;
        ;
        const cumulativeTotal = result[0].sumTotalBought;
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
    async updateDBSupply({ chainId, totalSold }) {
        return await this.prisma.chainToken.update({
            where: { chainId },
            data: { totalBought: totalSold }
        });
    }
    async getCumulativeTotalBought() {
        const chainTokens = await this.prisma.chainToken.findMany({
            select: { totalBought: true }
        });
        return chainTokens.reduce((sum, token) => sum + BigInt(token.totalBought), BigInt(0));
    }
    async setLaunchTime(time) {
        const existingLaunchTime = await this.prisma.launchTime.findFirst();
        if (existingLaunchTime) {
            return await this.prisma.launchTime.update({
                where: { id: existingLaunchTime.id },
                data: { time },
            });
        }
        else {
            return await this.prisma.launchTime.create({
                data: { time },
            });
        }
    }
    async getLaunchTime() {
        const launchTime = await this.prisma.launchTime.findFirst();
        if (launchTime) {
            return launchTime.time;
        }
        return null;
    }
    getTokenForNextPhase(phase) {
        let tokenForNextPhase = Number(global_config_1.PHASES[phase].totalTokensForSale);
        for (let i = 2; i <= phase; i++) {
            tokenForNextPhase += Number(global_config_1.PHASES[i].totalTokensForSale);
        }
        return tokenForNextPhase.toLocaleString('fullwide', { useGrouping: false });
    }
    async getOldPhase(chainTokenId) {
        const oldRecord = await this.prisma.chainToken.findUnique({
            where: { id: chainTokenId }
        });
        return oldRecord?.phase || 1;
    }
    calculatePhase(totalBought) {
        let phase = 1;
        const total = BigInt(Number(totalBought).toLocaleString('fullwide', { useGrouping: false }));
        for (const [p, config] of Object.entries(global_config_1.PHASES)) {
            phase = Number(p);
            const tokenForNextPhase = this.getTokenForNextPhase(phase);
            if (total < BigInt(Number(tokenForNextPhase) - (Number((0, ethers_1.parseEther)("20"))))) {
                break;
            }
        }
        return phase;
    }
    async handlePhaseTransition(phase, address) {
        const phaseConfig = global_config_1.PHASES[phase];
        try {
            await this.phaseService.setSaleParamsAllChains(phaseConfig.priceInUsd);
        }
        catch (error) {
            console.error(`Failed to handle phase transition to phase ${phase}:`, error);
        }
    }
    async getAllChainsStatus() {
        try {
            const chainTokens = await this.prisma.chainToken.findMany({
                select: {
                    chainId: true,
                    address: true,
                    totalBought: true
                }
            });
            return chainTokens;
        }
        catch (error) {
            console.error('Error getting chain status:', error);
            throw error;
        }
    }
    getPhaseConfig(phase) {
        const phaseConfig = global_config_1.PHASES[phase];
        if (!phaseConfig) {
            console.warn(`Phase ${phase} config not found, using phase 1`);
            return global_config_1.PHASES[1];
        }
        return phaseConfig;
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        phase_service_1.PhaseService])
], TokenService);
//# sourceMappingURL=token.service.js.map