import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PhaseConfig, PHASES } from "src/global.config";
import { TokenService } from "src/services/token.service";


@ApiTags('presale')
@Controller('presale')
export class PresaleController {
    constructor(private readonly tokenService: TokenService) { }


    @Get('phases')
    async getPhases(): Promise<{ phases: Record<number, PhaseConfig>; }> {
        return {
            phases: PHASES
        }
    }


    @Get('status')
    async getPresaleStatus() {
        const chains = await this.tokenService.getAllChainsStatus();

        // Calculate cumulative totals
        const totalBought = chains.reduce((sum, chain) =>
            sum + BigInt(chain.totalBought), BigInt(0)
        ).toString();

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
}