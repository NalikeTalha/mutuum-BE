import { Injectable, OnModuleInit } from "@nestjs/common";
import { ethers } from "ethers";
import { abi as mutuumPresaleAbi } from "src/abis/MutuumPresale.abi";
import { CHAIN_CONFIGS } from "src/global.config";

@Injectable()
export class PhaseService implements OnModuleInit {
    private contracts = new Map<number, ethers.Contract>();
    private wallets = new Map<number, ethers.Wallet>();

    async onModuleInit() {
        const chains = CHAIN_CONFIGS;
        // const abi = ["function setSaleParams(uint256 _priceInUSD, uint256 _totalTokensForSale) external"];
        const abi = mutuumPresaleAbi;

        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) throw new Error('PRIVATE_KEY not set');

        for (const chain of chains) {
            const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
            const wallet = new ethers.Wallet(privateKey, provider);
            const contract = new ethers.Contract(chain.contractAddress, abi, wallet);

            this.contracts.set(chain.chainId, contract);
            this.wallets.set(chain.chainId, wallet);
        }
    }

    async setSaleParamsAllChains(priceInUsd: string, totalTokensForSale: string) {
        const setParamsPromises = Array.from(this.contracts.entries())
            .map(async ([chainId, contract]) => {
                try {
                    console.log(`setting following parameters to chainId: ${chainId}`)
                    console.log(`priceInUsd: ${priceInUsd} totalTokensForSale: ${chainId}`)
                    const tx = await contract.setSaleParams(priceInUsd, totalTokensForSale);
                    console.log('tx.hash', tx.hash)
                    await tx.wait();
                    console.log(`Phase updated on chain ${chainId}: ${tx.hash}`);
                } catch (error) {
                    console.error(`Failed to update phase on chain ${chainId}:`, error);
                }
            });

        await Promise.allSettled(setParamsPromises);
    }

    async getTotalBuyersAllChains(): Promise<number> {
        const totalBuyersPromises = Array.from(this.contracts.entries())
            .map(async ([chainId, contract]) => {
                try {
                    console.log(`Fetching totalBought from chainId: ${chainId}`);
                    const totalBought = await contract.totalBuyers();
                    console.log(`totalBought on chain ${chainId}:`, totalBought.toString());
                    return parseFloat(totalBought.toString()); // Convert BigNumber to a number
                } catch (error) {
                    console.error(`Failed to fetch totalBought on chain ${chainId}:`, error);
                    return 0; // Return 0 if the call fails
                }
            });

        const results = await Promise.allSettled(totalBuyersPromises);

        // Sum up all successful results
        const totalBoughtSum = results.reduce((sum, result) => {
            if (result.status === 'fulfilled') {
                return sum + result.value;
            }
            return sum; // Ignore rejected promises
        }, 0);

        console.log(`Total sum of totalBought across all chains: ${totalBoughtSum}`);
        return totalBoughtSum;
    }
}