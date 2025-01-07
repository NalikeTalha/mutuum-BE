import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './services/prisma.service';
import { TokenService } from './services/token.service';
import { BlockchainService } from './services/blockchain.service';
import { PhaseService } from './services/phase.service';
import { PresaleController } from './controllers/presale.controller';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers:[PresaleController],
    providers: [PrismaService, TokenService, BlockchainService, PhaseService],
})
export class AppModule { }