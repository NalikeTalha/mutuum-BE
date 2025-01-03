import { Injectable, OnModuleInit } from "@nestjs/common";
import { ethers } from "ethers";
import { CHAIN_CONFIGS } from "src/global.config";

@Injectable()
export class PhaseService implements OnModuleInit {
    private contracts = new Map<number, ethers.Contract>();
    private wallets = new Map<number, ethers.Wallet>();

    async onModuleInit() {
        const chains = CHAIN_CONFIGS;
        const abi = ["function setSaleParams(uint256 _priceInUSD, uint256 _totalTokensForSale) external"];

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
                    console.log('tx', tx)
                    console.log('tx.hash', tx.hash)
                    await tx.wait();
                    console.log(`Phase updated on chain ${chainId}: ${tx.hash}`);
                } catch (error) {
                    console.error(`Failed to update phase on chain ${chainId}:`, error);
                }
            });

        await Promise.allSettled(setParamsPromises);
    }
}