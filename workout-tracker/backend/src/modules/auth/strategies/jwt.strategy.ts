import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // Em produção isso DEVE vir de variável de ambiente!
            secretOrKey: process.env.JWT_SECRET || 'velocity_secret_key_super_safe_2026',
        });
    }

    async validate(payload: { sub: string; email: string }) {
        if (!payload.sub) {
            throw new UnauthorizedException();
        }
        return { userId: payload.sub, email: payload.email };
    }
}
