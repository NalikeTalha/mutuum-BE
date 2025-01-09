import { OnModuleInit } from '@nestjs/common';
import { TokenService } from './token.service';
export declare class BlockchainService implements OnModuleInit {
    private tokenService;
    private contracts;
    private wallets;
    constructor(tokenService: TokenService);
    onModuleInit(): Promise<void>;
    private initChainToken;
    private setupEventListener;
}
