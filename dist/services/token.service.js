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
let TokenService = class TokenService {
    constructor(prisma, phaseService) {
        this.prisma = prisma;
        this.phaseService = phaseService;
    }
    async initializeChainToken(chainId, address, totalBought) {
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
                await this.handlePhaseTransition(newPhase, chainToken.address);
                await tx.chainToken.updateMany({
                    data: { phase: newPhase }
                });
            }
            return { chainToken, phase: newPhase };
        });
        return chainToken;
    }
    async getCumulativeTotalBought() {
        const chainTokens = await this.prisma.chainToken.findMany({
            select: { totalBought: true }
        });
        return chainTokens.reduce((sum, token) => sum + BigInt(token.totalBought), BigInt(0));
    }
    async getOldPhase(chainTokenId) {
        const oldRecord = await this.prisma.chainToken.findUnique({
            where: { id: chainTokenId }
        });
        return oldRecord?.phase || 1;
    }
    calculatePhase(totalBought) {
        let phase = 1;
        const total = BigInt(totalBought);
        for (const [p, config] of Object.entries(global_config_1.PHASES)) {
            if (total < BigInt(config.tokensForPhase)) {
                break;
            }
            phase = Number(p);
        }
        return phase;
    }
    async handlePhaseTransition(phase, address) {
        const phaseConfig = global_config_1.PHASES[phase];
        try {
            await this.phaseService.setSaleParamsAllChains(phaseConfig.priceInUsd, phaseConfig.totalTokensForSale);
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