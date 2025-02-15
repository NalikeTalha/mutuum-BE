"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("./services/prisma.service");
const token_service_1 = require("./services/token.service");
const blockchain_service_1 = require("./services/blockchain.service");
const phase_service_1 = require("./services/phase.service");
const presale_controller_1 = require("./controllers/presale.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot()],
        controllers: [presale_controller_1.PresaleController],
        providers: [prisma_service_1.PrismaService, token_service_1.TokenService, blockchain_service_1.BlockchainService, phase_service_1.PhaseService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map