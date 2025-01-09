"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHASES = exports.CHAIN_CONFIGS = exports.CHAIN_CONFIGS_PROD = exports.CHAIN_CONFIGS_DEV = void 0;
const ethers_1 = require("ethers");
exports.CHAIN_CONFIGS_DEV = [
    {
        "chainId": 97,
        "rpcUrl": "https://bsc-testnet.infura.io/v3/2c3a1602edd64164b85fab409c12046b",
        "contractAddress": "0xbA0805271367f8F88917a15eb1FE216CD15a9743"
    },
    {
        "chainId": 11155111,
        "rpcUrl": "https://sepolia.infura.io/v3/2c3a1602edd64164b85fab409c12046b",
        "contractAddress": "0xe4D9c42477B67Abf2372188c4a2B9948ca054911"
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
        tokensForPhase: (0, ethers_1.parseEther)('1000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.001').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('1000').toString()
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
        tokensForPhase: (0, ethers_1.parseEther)('100000').toString(),
        priceInUsd: (0, ethers_1.parseEther)('0.1').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('88000').toString()
    },
};
//# sourceMappingURL=global.config.js.map