import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { formatEther } from "ethers";
import { PhaseConfig, PHASES } from "src/global.config";
import { PhaseService } from "src/services/phase.service";
import { TokenService } from "src/services/token.service";


@ApiTags('presale')
@Controller('presale')
export class PresaleController {
    constructor(
        private readonly tokenService: TokenService,
        private readonly phaseService: PhaseService
    ) { }

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

    @Get('details')
    async getPresaleDetails() {
        try {
            const chains = await this.tokenService.getAllChainsStatus();

            // Calculate cumulative totals
            const totalBought = chains.reduce((sum, chain) =>
                sum + BigInt(chain.totalBought), BigInt(0)
            ).toString();

            const currentPhase = this.tokenService.calculatePhase(totalBought);
            const phaseConfig = this.tokenService.getPhaseConfig(currentPhase);

            console.log('phaseConfig',phaseConfig)
            let totalRaisedInUsd = 0

            for (let i = 1; i <= currentPhase; i++) {
                const phaseDetails = this.tokenService.getPhaseConfig(i)
                if (currentPhase == 1) {
                    if (totalBought < phaseDetails.tokensForPhase) {
                        totalRaisedInUsd = Number(formatEther(totalBought)) * Number(formatEther(phaseDetails.priceInUsd))
                    } else {
                        totalRaisedInUsd = Number(formatEther(phaseConfig.totalTokensForSale)) * Number(formatEther(phaseDetails.priceInUsd))
                    }
                } else {
                    if (totalBought < phaseDetails.tokensForPhase) {
                        totalRaisedInUsd += Number(formatEther(totalBought)) * Number(formatEther(phaseDetails.priceInUsd))
                    } else {
                        totalRaisedInUsd += Number(formatEther(phaseConfig.totalTokensForSale)) * Number(formatEther(phaseDetails.priceInUsd))
                    }
                }
            }

            const totalHolders = await this.phaseService.getTotalBuyersAllChains()

            return {
                totalBought: formatEther(totalBought),
                currentPhase,
                priceInUsd: formatEther(phaseConfig.priceInUsd),
                tokenToNextPhase: formatEther(phaseConfig.tokensForPhase),
                totalRaisedInUsd,
                totalHolders
            };
        } catch (err) {
            console.log('err', err)
            return err
        }
    }


}