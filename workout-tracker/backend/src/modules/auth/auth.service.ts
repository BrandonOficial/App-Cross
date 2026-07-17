import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
    private redisClient: Redis;

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {
        // Conexão com Redis (Usando localhost em dev se não estiver rodando no docker interno)
        this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    async register(data: RegisterDto) {
        const userExists = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (userExists) {
            throw new ConflictException('E-mail já está em uso.');
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
            },
        });

        return this.generateTokens(user.id, user.email, user.name);
    }

    async login(data: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);

        if (!passwordMatches) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        return this.generateTokens(user.id, user.email, user.name);
    }

    async logout(userId: string) {
        await this.redisClient.del(`refresh_token:${userId}`);
        return { success: true };
    }

    async refreshTokens(refreshToken: string) {
        try {
            // Decodifica e verifica o refresh token
            const payload = this.jwtService.verify(refreshToken);
            const userId = payload.sub;

            // Verifica se o token ainda está válido no Redis
            const storedToken = await this.redisClient.get(`refresh_token:${userId}`);
            if (!storedToken || storedToken !== refreshToken) {
                throw new UnauthorizedException('Refresh token inválido ou expirado.');
            }

            // Busca dados atualizados do usuário
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new UnauthorizedException('Usuário não encontrado.');
            }

            // Gera novo par de tokens
            return this.generateTokens(user.id, user.email, user.name);
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('Refresh token inválido ou expirado.');
        }
    }

    private async generateTokens(userId: string, email: string, name: string) {
        const payload = { sub: userId, email };

        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        // Salva o refresh token no Redis para controle de sessão (revogação)
        await this.redisClient.set(`refresh_token:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

        return {
            user: { id: userId, email, name },
            accessToken,
            refreshToken,
        };
    }
}
