"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhaseService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const MutuumPresale_abi_1 = require("../abis/MutuumPresale.abi");
const global_config_1 = require("../global.config");
let PhaseService = class PhaseService {
    constructor() {
        this.contracts = new Map();
        this.wallets = new Map();
    }
    async onModuleInit() {
        const chains = global_config_1.CHAIN_CONFIGS;
        const abi = MutuumPresale_abi_1.abi;
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey)
            throw new Error('PRIVATE_KEY not set');
        for (const chain of chains) {
            const provider = new ethers_1.ethers.JsonRpcProvider(chain.rpcUrl);
            const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
            const contract = new ethers_1.ethers.Contract(chain.contractAddress, abi, wallet);
            this.contracts.set(chain.chainId, contract);
            this.wallets.set(chain.chainId, wallet);
        }
    }
    async setSaleParamsAllChains(priceInUsd) {
        const setParamsPromises = Array.from(this.contracts.entries())
            .map(async ([chainId, contract]) => {
            const maxRetries = 5;
            let attempt = 0;
            while (attempt < maxRetries) {
                try {
                    console.log(`setting following parameters to chainId: ${chainId}`);
                    console.log(`priceInUsd: ${priceInUsd}`);
                    const tx = await contract.setSaleParams(priceInUsd);
                    console.log('tx.hash', tx.hash);
                    await tx.wait();
                    console.log(`Phase updated on chain ${chainId}: ${tx.hash}`);
                    break;
                }
                catch (error) {
                    attempt++;
                    console.error(`Failed to update phase on chain ${chainId}, attempt ${attempt}:`, error);
                    if (attempt >= maxRetries) {
                        console.error(`Max retries reached for chain ${chainId}`);
                    }
                }
            }
        });
        await Promise.allSettled(setParamsPromises);
    }
    async getTotalBuyersAllChains() {
        const totalBuyersPromises = Array.from(this.contracts.entries())
            .map(async ([chainId, contract]) => {
            try {
                console.log(`Fetching totalBought from chainId: ${chainId}`);
                const totalBought = await contract.totalBuyers();
                console.log(`totalBought on chain ${chainId}:`, totalBought.toString());
                return parseFloat(totalBought.toString());
            }
            catch (error) {
                console.error(`Failed to fetch totalBought on chain ${chainId}:`, error);
                return 0;
            }
        });
        const results = await Promise.allSettled(totalBuyersPromises);
        const totalBoughtSum = results.reduce((sum, result) => {
            if (result.status === 'fulfilled') {
                return sum + result.value;
            }
            return sum;
        }, 0);
        console.log(`Total sum of totalBought across all chains: ${totalBoughtSum}`);
        return totalBoughtSum;
    }
    async getIsLiveAllChains() {
        const allIsLivePromises = Array.from(this.contracts.entries())
            .map(async ([chainId, contract]) => {
            try {
                console.log(`Fetching isLive from chainId: ${chainId}`);
                const isLive = await contract.isLive();
                console.log(`isLive on chain ${chainId}:`, isLive.toString());
                return isLive;
            }
            catch (error) {
                console.error(`Failed to fetch isLive on chain ${chainId}:`, error);
                return 0;
            }
        });
        const results = await Promise.all(allIsLivePromises);
        const isAllLive = results.every(value => value == true);
        console.log('isAllLive', isAllLive);
        return isAllLive;
    }
    async getLatestSold() {
        const getLatestSoldPromises = Array.from(this.contracts.entries())
            .map(async ([chainId, contract]) => {
            try {
                console.log(`Fetching token Sold from chainId: ${chainId}`);
                const tokenSold = await contract.totalTokensSold();
                console.log(`token sold on chain ${chainId}:`, tokenSold.toString());
                return { chainId, tokenSold: tokenSold.toLocaleString('fullwide', { useGrouping: false }) };
            }
            catch (error) {
                console.error(`Failed to fetch token sold on chain ${chainId}:`, error);
                return { chainId, tokenSold: 0 };
            }
        });
        const results = await Promise.all(getLatestSoldPromises);
        const soldArray = results.reduce((acc, { chainId, tokenSold }) => {
            acc[chainId] = tokenSold;
            return acc;
        }, {});
        return soldArray;
    }
    async getNativePrices(priceInUsd) {
        const getNativePrices = Array.from(this.contracts.entries())
            .map(async ([chainId, contract]) => {
            try {
                console.log(`Fetching NativePrices from chainId: ${chainId}`);
                const nativePrice = Number((0, ethers_1.formatEther)((await contract.getETHPrice()).toString())) / priceInUsd;
                console.log(`NativePrices on chain ${chainId}:`, nativePrice.toString());
                return { chainId, nativePrice };
            }
            catch (error) {
                console.error(`Failed to fetch NativePrices on chain ${chainId}:`, error);
                return { chainId, nativePrice: 0 };
            }
        });
        const results = await Promise.all(getNativePrices);
        const nativePrices = results.reduce((acc, { chainId, nativePrice }) => {
            acc[chainId] = nativePrice;
            return acc;
        }, {});
        return nativePrices;
    }
};
exports.PhaseService = PhaseService;
exports.PhaseService = PhaseService = __decorate([
    (0, common_1.Injectable)()
], PhaseService);
//# sourceMappingURL=phase.service.js.map