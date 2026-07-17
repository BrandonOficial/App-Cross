// backend/src/modules/workouts/workouts.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { LogWorkoutSetDto } from './dto/log-workout-set.dto';

@Injectable()
export class WorkoutsService {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Dashboard Summary ───
    async getSummary(userId: string) {
        // Total de sessões do usuário
        const totalSessions = await this.prisma.workoutSession.count({
            where: { userId },
        });

        // Por que puxamos todos os dados dos últimos 7 dias em memória e processamos no Node?
        // Porque calcular agregações complexas diárias diretamente no banco (PostgreSQL) usando GroupBy 
        // e Timezones pode gerar gargalos no DB. No Node, esse loop de 7 itens é O(1) e tira a carga do banco.
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentSessions = await this.prisma.workoutSession.findMany({
            where: {
                userId,
                startTime: { gte: sevenDaysAgo },
            },
            include: {
                sets: true,
            },
        });

        // Volume semanal total
        let weeklyVolume = 0;
        const dailyVolumes: Record<string, number> = {};
        const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        // Inicializa todos os dias com 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dailyVolumes[DAYS[d.getDay()]] = 0;
        }

        recentSessions.forEach((session) => {
            const dayKey = DAYS[new Date(session.startTime).getDay()];
            session.sets.forEach((set) => {
                const vol = Number(set.weight) * set.reps;
                weeklyVolume += vol;
                dailyVolumes[dayKey] = (dailyVolumes[dayKey] || 0) + vol;
            });
        });

        // Por que calcular a Ofensiva (Streak) em memória iterando os dias?
        // Lógicas recursivas ou "window functions" no banco de dados para achar sequências ininterruptas 
        // são pesadas (costosas). Iterar 365 dias localmente leva menos de 1ms de CPU e preserva o banco.
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const streakStartDate = new Date(today);
        streakStartDate.setDate(streakStartDate.getDate() - 365);

        const streakSessions = await this.prisma.workoutSession.findMany({
            where: {
                userId,
                startTime: { gte: streakStartDate },
            },
            select: {
                startTime: true,
            },
        });

        const workoutDates = new Set(
            streakSessions.map((s) => {
                const d = new Date(s.startTime);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }),
        );

        let streak = 0;
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

            if (workoutDates.has(dateStr)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        // Calorias estimadas (~ 5 cal por kg movido — estimativa simplificada)
        const estimatedCalories = Math.round(weeklyVolume * 0.05);

        return {
            totalSessions,
            weeklyVolume: Math.round(weeklyVolume),
            dailyVolumes,
            currentStreak: streak,
            estimatedCalories,
        };
    }

    // ─── Última sessão do usuário ───
    async getLatestSession(userId: string) {
        const session = await this.prisma.workoutSession.findFirst({
            where: { userId },
            orderBy: { startTime: 'desc' },
            include: {
                routine: true,
                sets: {
                    include: { exercise: true },
                    orderBy: { completedAt: 'asc' },
                },
            },
        });

        if (!session) return null;

        // Calcula métricas da sessão
        const totalVolume = session.sets.reduce((sum, set) => {
            return sum + (Number(set.weight) * set.reps);
        }, 0);

        const duration = session.endTime
            ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
            : null;

        return {
            ...session,
            totalVolume: Math.round(totalVolume),
            durationMinutes: duration,
        };
    }

    // ─── Detalhes de uma sessão ───
    async getSession(sessionId: string, userId: string) {
        const session = await this.prisma.workoutSession.findUnique({
            where: { id: sessionId },
            include: {
                routine: true,
                sets: {
                    include: { exercise: true },
                    orderBy: { completedAt: 'asc' },
                },
            },
        });

        if (!session) {
            throw new NotFoundException('Sessão não encontrada.');
        }

        if (session.userId !== userId) {
            throw new ForbiddenException('Você não tem permissão para acessar esta sessão.');
        }

        // Calcula volume total
        const totalVolume = session.sets.reduce((sum, set) => {
            return sum + (Number(set.weight) * set.reps);
        }, 0);

        // Calcula duração em minutos
        const durationMinutes = session.endTime
            ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
            : null;

        return {
            ...session,
            totalVolume: Math.round(totalVolume),
            durationMinutes,
        };
    }

    // ─── CRUD ───

    async createSession(userId: string, data: CreateWorkoutSessionDto) {
        const userExists = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            throw new NotFoundException('Usuário não encontrado na base de dados.');
        }

        return this.prisma.workoutSession.create({
            data: {
                userId: userId,
                routineId: data.routineId,
            },
        });
    }

    async logSet(sessionId: string, userId: string, data: LogWorkoutSetDto) {
        const session = await this.prisma.workoutSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException('Sessão de treino não encontrada ou já finalizada.');
        }

        if (session.userId !== userId) {
            throw new ForbiddenException('Você não tem permissão para alterar esta sessão.');
        }

        // Cria o set
        const newSet = await this.prisma.workoutSet.create({
            data: {
                sessionId,
                exerciseId: data.exerciseId,
                setType: data.setType,
                weight: data.weight,
                reps: data.reps,
                rpe: data.rpe,
            },
        });

        // Detecção de PR: verifica se o peso é o maior já registrado para este exercício pelo usuário
        const previousBest = await this.prisma.workoutSet.findFirst({
            where: {
                exerciseId: data.exerciseId,
                session: { userId: session.userId },
                id: { not: newSet.id }, // Exclui o set recém-criado
            },
            orderBy: { weight: 'desc' },
            select: { weight: true },
        });

        const isPR = !previousBest || Number(data.weight) > Number(previousBest.weight);

        return {
            ...newSet,
            isPR,
        };
    }

    async finishSession(sessionId: string, userId: string) {
        const session = await this.prisma.workoutSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException('Sessão de treino não encontrada.');
        }

        if (session.userId !== userId) {
            throw new ForbiddenException('Você não tem permissão para alterar esta sessão.');
        }

        return this.prisma.workoutSession.update({
            where: { id: sessionId },
            data: { endTime: new Date() },
            include: {
                sets: {
                    include: { exercise: true },
                    orderBy: { completedAt: 'asc' },
                },
            },
        });
    }
}