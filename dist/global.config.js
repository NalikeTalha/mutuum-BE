"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHASES = exports.CHAIN_CONFIGS = exports.CHAIN_CONFIGS_PROD = exports.CHAIN_CONFIGS_DEV = void 0;
const ethers_1 = require("ethers");
exports.CHAIN_CONFIGS_DEV = [
    {
        "chainId": 97,
        "rpcUrl": "https://bsc-testnet.infura.io/v3/8c9b43975fae4c7c8e7caa3fe0a9eaf3",
        "contractAddress": "0x4fFB58E8C97f408bD0D81E93966EbD1D4d7B56B7"
    },
    {
        "chainId": 11155111,
        "rpcUrl": "https://sepolia.infura.io/v3/8c9b43975fae4c7c8e7caa3fe0a9eaf3",
        "contractAddress": "0x5D4279c7AC752C01aeEcE33809e19c4E449ebF74"
    },
];
exports.CHAIN_CONFIGS_PROD = [
    {
        "chainId": 56,
        "rpcUrl": "https://binance.llamarpc.com",
        "contractAddress": "0x2f38323d899751323C04145B05d5FefC513b1519"
    },
    {
        "chainId": 1,
        "rpcUrl": "https://eth.meowrpc.com",
        "contractAddress": "0xeEAB23d916dA13CcB30fDB494a85c12638CFbB9B"
    },
    {
        "chainId": 137,
        "rpcUrl": "https://polygon.llamarpc.com",
        "contractAddress": "0x89de37f99a0ea5a6594eda4ee567d97e1b8111d9"
    }
];
console.log('process.env.IS_LIVE', process.env.IS_LIVE);
exports.CHAIN_CONFIGS = process.env.IS_LIVE == 'true' ? exports.CHAIN_CONFIGS_PROD : exports.CHAIN_CONFIGS_DEV;
exports.PHASES = {
    1: {
        tokensForPhase: (0, ethers_1.parseEther)('5000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.001').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('5000').toString()
    },
    2: {
        tokensForPhase: (0, ethers_1.parseEther)('11000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.01').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('10000').toString()
    },
    3: {
        tokensForPhase: (0, ethers_1.parseEther)('22000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.02').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('11000').toString()
    },
    4: {
        tokensForPhase: (0, ethers_1.parseEther)('44000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.03').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('22000').toString()
    },
    5: {
        tokensForPhase: (0, ethers_1.parseEther)('88000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.4').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('44000').toString()
    },
    6: {
        tokensForPhase: (0, ethers_1.parseEther)('108000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.05').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('22000').toString()
    },
    7: {
        tokensForPhase: (0, ethers_1.parseEther)('128000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.06').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('22000').toString()
    },
    8: {
        tokensForPhase: (0, ethers_1.parseEther)('148000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.07').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('22000').toString()
    },
    9: {
        tokensForPhase: (0, ethers_1.parseEther)('168000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.08').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('22000').toString()
    },
    10: {
        tokensForPhase: (0, ethers_1.parseEther)('188000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.09').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('22000').toString()
    },
};
//# sourceMappingURL=global.config.js.map