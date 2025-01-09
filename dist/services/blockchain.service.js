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
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const token_service_1 = require("./token.service");
const global_config_1 = require("../global.config");
let BlockchainService = class BlockchainService {
    constructor(tokenService) {
        this.tokenService = tokenService;
        this.contracts = new Map();
        this.wallets = new Map();
    }
    async onModuleInit() {
        const chains = global_config_1.CHAIN_CONFIGS;
        const abi = [
            "event BuyToken(address indexed buyer, address indexed token, uint256 amountIn, uint256 amountOut)",
            "function totalTokensSold() view returns (uint256)",
            "function setSaleParams(uint256 _priceInUSD, uint256 _totalTokensForSale) external"
        ];
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey)
            throw new Error('PRIVATE_KEY not set');
        for (const chain of chains) {
            const provider = new ethers_1.JsonRpcProvider(chain.rpcUrl);
            const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
            const contract = new ethers_1.ethers.Contract(chain.contractAddress, abi, provider);
            this.contracts.set(chain.chainId, contract);
            this.wallets.set(chain.chainId, wallet);
            await this.initChainToken(chain.chainId, chain.contractAddress);
            this.setupEventListener(chain.chainId, contract);
        }
    }
    async initChainToken(chainId, address) {
        const contract = this.contracts.get(chainId);
        const totalSold = await contract.totalTokensSold();
        await this.tokenService.initializeChainToken(chainId, address, totalSold.toString());
    }
    setupEventListener(chainId, contract) {
        contract.on("BuyToken", async (buyer, token, amountIn, amountOut) => {
            try {
                console.log(`token bought event ${chainId}, buyer: ${buyer}, token: ${token}, amount: ${amountOut}`);
                const totalSold = await contract.totalTokensSold();
                await this.tokenService.recordTradeAndUpdate(chainId, buyer, amountOut.toString(), totalSold.toString());
            }
            catch (error) {
                console.error(`Error processing event on chain ${chainId}:`, error);
            }
        });
    }
    async getTotalSold(chainId) {
        try {
            const contract = this.contracts.get(chainId);
            if (!contract) {
                throw new Error(`No contract initialized for chain ${chainId}`);
            }
            const totalSold = await contract.totalTokensSold();
            return totalSold.toString();
        }
        catch (error) {
            console.error(`Error fetching total sold for chain ${chainId}:`, error);
            return "0";
        }
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_service_1.TokenService])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map