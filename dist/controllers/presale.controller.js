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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresaleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const ethers_1 = require("ethers");
const global_config_1 = require("../global.config");
const phase_service_1 = require("../services/phase.service");
const token_service_1 = require("../services/token.service");
class SetLaunchTimeDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The launch time in ISO 8601 format',
        example: '2025-01-10T14:30:00.000Z',
        type: String
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetLaunchTimeDto.prototype, "time", void 0);
let PresaleController = class PresaleController {
    constructor(tokenService, phaseService) {
        this.tokenService = tokenService;
        this.phaseService = phaseService;
    }
    async getPhases() {
        return {
            phases: global_config_1.PHASES
        };
    }
    async recordTransaction() {
        try {
            const totalSoldArray = await this.phaseService.getLatestSold();
            await this.tokenService.updateMultipleDBSupplies(totalSoldArray);
            return true;
        }
        catch (err) {
            console.log('err', err);
            return err;
        }
    }
    async getPresaleStatus() {
        try {
            const chains = await this.tokenService.getAllChainsStatus();
            const totalBought = chains.reduce((sum, chain) => sum + BigInt(chain.totalBought), BigInt(0)).toString();
            const currentPhase = this.tokenService.calculatePhase(totalBought);
            const phaseConfig = this.tokenService.getPhaseConfig(currentPhase);
            return {
                chains,
                totalBought,
                currentPhase,
                priceInUsd: phaseConfig.priceInUsd,
                totalTokensForSale: phaseConfig.totalTokensForSale
            };
        }
        catch (err) {
            console.log('err', err);
            return err;
        }
    }
    async getPresaleDetails() {
        try {
            const chains = await this.tokenService.getAllChainsStatus();
            const totalBought = chains.reduce((sum, chain) => sum + BigInt(chain.totalBought), BigInt(0)).toString();
            const currentPhase = this.tokenService.calculatePhase(totalBought);
            const phaseConfig = this.tokenService.getPhaseConfig(currentPhase);
            console.log('phaseConfig', phaseConfig);
            let totalRaisedInUsd = 0;
            for (let i = 1; i <= currentPhase; i++) {
                const phaseDetails = this.tokenService.getPhaseConfig(i);
                if (currentPhase == 1) {
                    if (totalBought < phaseDetails.tokensForPhase) {
                        totalRaisedInUsd = Number((0, ethers_1.formatEther)(totalBought)) * Number((0, ethers_1.formatEther)(phaseDetails.priceInUsd));
                    }
                    else {
                        totalRaisedInUsd = Number((0, ethers_1.formatEther)(phaseConfig.totalTokensForSale)) * Number((0, ethers_1.formatEther)(phaseDetails.priceInUsd));
                    }
                }
                else {
                    if (totalBought < phaseDetails.tokensForPhase) {
                        totalRaisedInUsd += Number((0, ethers_1.formatEther)(totalBought)) * Number((0, ethers_1.formatEther)(phaseDetails.priceInUsd));
                    }
                    else {
                        totalRaisedInUsd += Number((0, ethers_1.formatEther)(phaseConfig.totalTokensForSale)) * Number((0, ethers_1.formatEther)(phaseDetails.priceInUsd));
                    }
                }
            }
            const totalHolders = await this.phaseService.getTotalBuyersAllChains();
            const isLive = await this.phaseService.getIsLiveAllChains();
            const nativePrices = await this.phaseService.getNativePrices(Number((0, ethers_1.formatEther)(phaseConfig.priceInUsd)));
            console.log('nativePrices', nativePrices);
            const launchTime = await this.tokenService.getLaunchTime();
            return {
                totalBought: (0, ethers_1.formatEther)(totalBought),
                currentPhase,
                priceInUsd: (0, ethers_1.formatEther)(phaseConfig.priceInUsd),
                tokenToNextPhase: (0, ethers_1.formatEther)(phaseConfig.tokensForPhase),
                totalRaisedInUsd,
                totalHolders,
                isLive,
                launchTime,
                nativePrices: { ...nativePrices }
            };
        }
        catch (err) {
            console.log('err', err);
            return err;
        }
    }
    async setLaunchTime(launchTimeDto) {
        try {
            const date = new Date(launchTimeDto.time);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            return await this.tokenService.setLaunchTime(date);
        }
        catch (err) {
            console.log('err', err);
            throw err;
        }
    }
};
exports.PresaleController = PresaleController;
__decorate([
    (0, common_1.Get)('phases'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PresaleController.prototype, "getPhases", null);
__decorate([
    (0, common_1.Get)('refreshDBSupplyAndPhase'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PresaleController.prototype, "recordTransaction", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PresaleController.prototype, "getPresaleStatus", null);
__decorate([
    (0, common_1.Get)('details'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PresaleController.prototype, "getPresaleDetails", null);
__decorate([
    (0, common_1.Post)('launch-time'),
    (0, swagger_1.ApiOperation)({ summary: 'Set launch date and time' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SetLaunchTimeDto]),
    __metadata("design:returntype", Promise)
], PresaleController.prototype, "setLaunchTime", null);
exports.PresaleController = PresaleController = __decorate([
    (0, swagger_1.ApiTags)('presale'),
    (0, common_1.Controller)('presale'),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        phase_service_1.PhaseService])
], PresaleController);
//# sourceMappingURL=presale.controller.js.map