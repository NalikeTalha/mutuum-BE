"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHASES = exports.CHAIN_CONFIGS = exports.CHAIN_CONFIGS_PROD = exports.CHAIN_CONFIGS_DEV = void 0;
const ethers_1 = require("ethers");
exports.CHAIN_CONFIGS_DEV = [
    {
        "chainId": 97,
        "rpcUrl": "https://bsc-testnet.infura.io/v3/8c9b43975fae4c7c8e7caa3fe0a9eaf3",
        "contractAddress": "0xfb0B93286664d8b4103FfA2c75D375fa2F154B8E"
    },
    {
        "chainId": 11155111,
        "rpcUrl": "https://sepolia.infura.io/v3/8c9b43975fae4c7c8e7caa3fe0a9eaf3",
        "contractAddress": "0x505164fdc2438bbE92806DE55954b3164B636cE3"
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
        priceInUsd: (0, ethers_1.parseEther)('0.0001').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('5000').toString()
    },
    2: {
        priceInUsd: (0, ethers_1.parseEther)('0.0005').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('10000').toString()
    },
    3: {
        priceInUsd: (0, ethers_1.parseEther)('0.001').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('15000').toString()
    },
    4: {
        priceInUsd: (0, ethers_1.parseEther)('0.005').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('20000').toString()
    },
    5: {
        priceInUsd: (0, ethers_1.parseEther)('0.1').toString(),
        totalTokensForSale: (0, ethers_1.parseEther)('25000').toString()
    }
};
//# sourceMappingURL=global.config.js.map