// backend/src/modules/history/history.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class HistoryService {
    constructor(private readonly prisma: PrismaService) { }

    async getSessionsHistory(userId: string) {
        // Validação de negócio básica
        const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        // Busca o histórico ordenado pelo mais recente
        return this.prisma.workoutSession.findMany({
            where: { userId },
            orderBy: { startTime: 'desc' },
            include: {
                routine: true, // Para sabermos o nome do treino (ex: Push Day)
                sets: {
                    include: {
                        exercise: true, // Traz os detalhes do exercício que foi feito
                    },
                    orderBy: {
                        completedAt: 'asc', // Ordem cronológica em que a série foi feita no dia
                    }
                }
            }
        });
    }

    async getExerciseProgress(userId: string, exerciseId: string) {
        // Validação
        const exerciseExists = await this.prisma.exercise.findUnique({ where: { id: exerciseId } });
        if (!exerciseExists) {
            throw new NotFoundException('Exercício não encontrado.');
        }

        // Buscamos todos os logs de sets desse usuário para esse exercício
        // Trazemos a sessão junto para sabermos a data exata.
        const sets = await this.prisma.workoutSet.findMany({
            where: {
                exerciseId,
                session: {
                    userId: userId,
                }
            },
            include: {
                session: {
                    select: {
                        startTime: true, // Usaremos a data de início da sessão como o eixo X do gráfico
                    }
                }
            },
            orderBy: {
                session: {
                    startTime: 'asc' // Do mais antigo para o mais novo (perfeito para gráficos de linha)
                }
            }
        });

        // Agregando os dados: Queremos extrair o maior peso usado em cada dia de treino (Top Set Max)
        // Isso é ótimo para visualizar a progressão pura de carga ao longo do tempo.
        const progressMap = new Map<string, number>();

        sets.forEach(set => {
            // Formata a data para YYYY-MM-DD para agrupar por dia
            const dateStr = set.session.startTime.toISOString().split('T')[0];
            const currentWeight = Number(set.weight); // Prisma retorna Decimal, convertendo para Number
            
            if (!progressMap.has(dateStr)) {
                progressMap.set(dateStr, currentWeight);
            } else {
                const maxWeightSoFar = progressMap.get(dateStr)!;
                if (currentWeight > maxWeightSoFar) {
                    progressMap.set(dateStr, currentWeight);
                }
            }
        });

        // Convertendo de Map para um Array de objetos que o Recharts engole perfeitamente
        const chartData = Array.from(progressMap, ([date, maxWeight]) => ({
            date,
            maxWeight
        }));

        return chartData;
    }
}
