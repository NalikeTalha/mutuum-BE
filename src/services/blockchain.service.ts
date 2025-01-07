import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers, JsonRpcProvider } from 'ethers';
import { TokenService } from './token.service';
import { CHAIN_CONFIGS } from 'src/global.config';

@Injectable()
export class BlockchainService implements OnModuleInit {
    private contracts = new Map<number, ethers.Contract>();
    private wallets = new Map<number, ethers.Wallet>();

    constructor(private tokenService: TokenService) { }

    async onModuleInit() {
        const chains = CHAIN_CONFIGS;

        const abi = [
            "event BuyToken(address indexed buyer, address indexed token, uint256 amountIn, uint256 amountOut)",
            "function totalTokensSold() view returns (uint256)",
            "function setSaleParams(uint256 _priceInUSD, uint256 _totalTokensForSale) external"
        ];

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

    async getTotalSold(chainId: number): Promise<string> {
        try {
            // Get the contract instance for this chain
            const contract = this.contracts.get(chainId);
            if (!contract) {
                throw new Error(`No contract initialized for chain ${chainId}`);
            }

            // Call totalTokensSold function from the contract
            const totalSold = await contract.totalTokensSold();

            // Convert BigNumber to string to maintain precision
            return totalSold.toString();

        } catch (error) {
            // Log the error but return "0" to prevent system failure
            console.error(`Error fetching total sold for chain ${chainId}:`, error);
            return "0";
        }
    }
}