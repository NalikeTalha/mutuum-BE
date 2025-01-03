import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './services/prisma.service';
import { TokenService } from './services/token.service';
import { BlockchainService } from './services/blockchain.service';
import { PhaseService } from './services/phase.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [PrismaService, TokenService, BlockchainService, PhaseService],
})
export class AppModule { }