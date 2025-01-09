import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers, JsonRpcProvider } from 'ethers';
import { TokenService } from './token.service';
import { CHAIN_CONFIGS } from 'src/global.config';
import { abi as mutuumPresaleAbi } from 'src/abis/MutuumPresale.abi';

@Injectable()
export class BlockchainService implements OnModuleInit {
    private contracts = new Map<number, ethers.Contract>();
    private wallets = new Map<number, ethers.Wallet>();

    constructor(private tokenService: TokenService) { }

    async onModuleInit() {
        const chains = CHAIN_CONFIGS;

        const abi = mutuumPresaleAbi

        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) throw new Error('PRIVATE_KEY not set');

        for (const chain of chains) {
            const provider = new JsonRpcProvider(chain.rpcUrl);
            const wallet = new ethers.Wallet(privateKey, provider);
            const contract = new ethers.Contract(chain.contractAddress, abi, provider);

            this.contracts.set(chain.chainId, contract);
            this.wallets.set(chain.chainId, wallet);

            await this.initChainToken(chain.chainId, chain.contractAddress);
            this.setupEventListener(chain.chainId, contract);
        }
    }

    private async initChainToken(chainId: number, address: string) {
        const contract = this.contracts.get(chainId);
        const totalSold = await contract.totalTokensSold();
        await this.tokenService.initializeChainToken(chainId, address, totalSold.toString());
    }

    private setupEventListener(chainId: number, contract: ethers.Contract) {
        contract.on("BuyToken", async (buyer, token, amountIn, amountOut) => {
            try {
                console.log(`token bought event ${chainId}, buyer: ${buyer}, token: ${token}, amount: ${amountOut}`)
                const totalSold = await contract.totalTokensSold();
                await this.tokenService.recordTradeAndUpdate(chainId, buyer, amountOut.toString(), totalSold.toString());
            } catch (error) {
                console.error(`Error processing event on chain ${chainId}:`, error);
            }
        });
    }
}