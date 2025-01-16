import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiTags } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { formatEther } from "ethers";
import { PhaseConfig, PHASES } from "src/global.config";
import { PhaseService } from "src/services/phase.service";
import { TokenService } from "src/services/token.service";


class SetLaunchTimeDto {
    @ApiProperty({
        description: 'The launch time in ISO 8601 format',
        example: '2025-01-10T14:30:00.000Z',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    time: string;  // Changed to string type
}

class getUserBalanceDto {
    @ApiProperty({
        description: 'The address of the user',
        example: '0xa941ABb07aD9763EEc74f8001fd4512A345Ba7D6',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    address: string;  // Changed to string type
}

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

    @Get('refreshDBSupplyAndPhase')
    async recordTransaction() {
        try{
            const totalSoldArray = await this.phaseService.getLatestSold();
            await this.tokenService.updateMultipleDBSupplies(totalSoldArray);
            return true
        }catch(err){
            console.log('err', err)
            return err
        }
    }

    @Get('status')
    async getPresaleStatus() {
        try {
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
        } catch (err) {
            console.log('err', err)
            return err
        }
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
            const tokenForNextPhase = this.tokenService.getTokenForNextPhase(currentPhase);

            console.log('phaseConfig', phaseConfig)
            let totalRaisedInUsd = 0

            for (let i = 1; i <= currentPhase; i++) {
                if (currentPhase == 1) {
                    const phaseDetails = this.tokenService.getPhaseConfig(currentPhase)
                    const tokenforNextPhase = this.tokenService.getTokenForNextPhase(currentPhase)
                    if (Number(totalBought) < Number(tokenforNextPhase)) {
                        totalRaisedInUsd = Number(formatEther(totalBought)) * Number(formatEther(phaseDetails.priceInUsd))
                    } else {
                        totalRaisedInUsd = Number(formatEther(phaseConfig.totalTokensForSale)) * Number(formatEther(phaseDetails.priceInUsd))
                    }
                } else {
                    const phaseDetails = this.tokenService.getPhaseConfig(i)
                    const tokenforNextPhase = this.tokenService.getTokenForNextPhase(i)
                    if (Number(totalBought) < Number(tokenforNextPhase)) {
                        totalRaisedInUsd += Number(formatEther(totalBought)) * Number(formatEther(phaseDetails.priceInUsd))
                    } else {
                        totalRaisedInUsd += Number(formatEther(phaseConfig.totalTokensForSale)) * Number(formatEther(phaseDetails.priceInUsd))
                    }
                }
            }

            const totalHolders = await this.phaseService.getTotalBuyersAllChains()
            const isLive = await this.phaseService.getIsLiveAllChains()
            const nativePrices = await this.phaseService.getNativePrices(Number(formatEther(phaseConfig.priceInUsd)))
            console.log('nativePrices', nativePrices)   

            const launchTime = await this.tokenService.getLaunchTime();

            return {
                totalBought: formatEther(totalBought),
                currentPhase,
                tokenForLastPhase: Number(formatEther(tokenForNextPhase))-Number(formatEther(phaseConfig.totalTokensForSale)),
                priceInUsd: formatEther(phaseConfig.priceInUsd),
                tokenToNextPhase: formatEther(tokenForNextPhase),
                totalRaisedInUsd,
                totalHolders,
                isLive,
                launchTime,
                nativePrices: {...nativePrices}
            };
        } catch (err) {
            console.log('err', err)
            return err
        }
    }

    @Post('getUserBalance')
    @ApiOperation({ summary: 'Get user balance' })
    async getUserBalance(@Body() body: getUserBalanceDto) { 
        try {
            return await this.phaseService.getTotalBalance(body.address);
        } catch (err) {
            console.log('err', err);
            return err;
        }
    }    

    @Post('launch-time')
    @ApiOperation({ summary: 'Set launch date and time' })
    async setLaunchTime(@Body() launchTimeDto: SetLaunchTimeDto) {
        try {
            const date = new Date(launchTimeDto.time);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            return await this.tokenService.setLaunchTime(date);
        } catch (err) {
            console.log('err', err);
            throw err;
        }
    }


}