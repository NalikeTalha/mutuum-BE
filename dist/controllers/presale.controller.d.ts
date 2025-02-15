import { PhaseConfig } from "src/global.config";
import { PhaseService } from "src/services/phase.service";
import { TokenService } from "src/services/token.service";
declare class SetLaunchTimeDto {
    time: string;
}
declare class getUserBalanceDto {
    address: string;
}
export declare class PresaleController {
    private readonly tokenService;
    private readonly phaseService;
    constructor(tokenService: TokenService, phaseService: PhaseService);
    getPhases(): Promise<{
        phases: Record<number, PhaseConfig>;
    }>;
    recordTransaction(): Promise<any>;
    getPresaleStatus(): Promise<any>;
    getPresaleDetails(): Promise<any>;
    getUserBalance(body: getUserBalanceDto): Promise<any>;
    setLaunchTime(launchTimeDto: SetLaunchTimeDto): Promise<{
        id: number;
        time: Date;
    }>;
}
export {};
