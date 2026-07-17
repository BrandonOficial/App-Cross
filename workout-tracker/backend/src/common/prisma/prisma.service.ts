// backend/src/common/prisma/prisma.service.ts
import * as dotenv from 'dotenv';
dotenv.config();

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        // 1. Criamos a conexão bruta usando o driver oficial do PostgreSQL
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });

        // 2. Passamos essa conexão para o adaptador do Prisma
        const adapter = new PrismaPg(pool);

        // 3. Alimentamos o construtor exatamente como o erro pediu
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('📦 Conexão com o PostgreSQL via Prisma Adapter estabelecida com sucesso!');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}