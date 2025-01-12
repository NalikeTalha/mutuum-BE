import { Injectable, OnModuleInit } from "@nestjs/common";
import { ethers, formatEther, parseEther } from "ethers";
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
                const maxRetries = 5;
                let attempt = 0;
                while (attempt < maxRetries) {
                    try {
                        console.log(`setting following parameters to chainId: ${chainId}`);
                        console.log(`priceInUsd: ${priceInUsd} totalTokensForSale: ${totalTokensForSale}`);
                        const tx = await contract.setSaleParams(priceInUsd, totalTokensForSale);
                        console.log('tx.hash', tx.hash);
                        await tx.wait();
                        console.log(`Phase updated on chain ${chainId}: ${tx.hash}`);
                        break; // Exit the loop if successful
                    } catch (error) {
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

    async getIsLiveAllChains(): Promise<boolean> {
        const allIsLivePromises = Array.from(this.contracts.entries())
            .map(async ([chainId, contract]) => {
                try {
                    console.log(`Fetching isLive from chainId: ${chainId}`);
                    const isLive = await contract.isLive();
                    console.log(`isLive on chain ${chainId}:`, isLive.toString());
                    return isLive
                } catch (error) {
                    console.error(`Failed to fetch isLive on chain ${chainId}:`, error);
                    return 0; // Return 0 if the call fails
                }
            });

        const results = await Promise.all(allIsLivePromises);

        // Check if every boolean in the array is true
        const isAllLive = results.every(value => value == true);
        console.log('isAllLive', isAllLive);

        return isAllLive;
    }

    async getLatestSold(): Promise<any> {
        const getLatestSoldPromises = Array.from(this.contracts.entries())
            .map(async ([chainId, contract]) => {
                try {
                    console.log(`Fetching token Sold from chainId: ${chainId}`);
                    const tokenSold = await contract.totalTokensSold();
                    console.log(`token sold on chain ${chainId}:`, tokenSold.toString());
                    return { chainId, tokenSold: tokenSold.toLocaleString('fullwide', { useGrouping: false }) }; // Convert BigNumber to a number
                } catch (error) {
                    console.error(`Failed to fetch token sold on chain ${chainId}:`, error);
                    return { chainId, tokenSold: 0 }; // Return 0 if the call fails
                }
            });

        const results = await Promise.all(getLatestSoldPromises);

        // Convert the array of results to an object
        const soldArray = results.reduce((acc, { chainId, tokenSold }) => {
            acc[chainId] = tokenSold;
            return acc;
        }, {});

        return soldArray;
    }

    async getNativePrices(priceInUsd: number): Promise<any> {
        const getNativePrices = Array.from(this.contracts.entries())
            .map(async ([chainId, contract]) => {
                try {
                    console.log(`Fetching NativePrices from chainId: ${chainId}`);
                    const nativePrice = Number(formatEther((await contract.getETHPrice()).toString())) / priceInUsd;
                    console.log(`NativePrices on chain ${chainId}:`, nativePrice.toString());
                    return { chainId, nativePrice };
                } catch (error) {
                    console.error(`Failed to fetch NativePrices on chain ${chainId}:`, error);
                    return { chainId, nativePrice: 0 }; // Return 0 if the call fails
                }
            });

        const results = await Promise.all(getNativePrices);

        // Convert the array of results to an object
        const nativePrices = results.reduce((acc, { chainId, nativePrice }) => {
            acc[chainId] = nativePrice;
            return acc;
        }, {});

        return nativePrices;
    }
}