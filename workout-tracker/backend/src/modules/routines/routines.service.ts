// backend/src/modules/routines/routines.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoutineDto } from './dto/create-routine.dto';

@Injectable()
export class RoutinesService {
    constructor(private readonly prisma: PrismaService) { }

    async createRoutine(userId: string, data: CreateRoutineDto) {
        // Por que validamos duplicatas no nível do Node (Service) em vez de jogar direto pro Prisma?
        // Porque se dependermos apenas da Constraint UNIQUE do banco de dados, o erro retornado
        // será um "PrismaClientKnownRequestError" genérico, difícil de tratar e formatar para o usuário.
        // Validando aqui, podemos lançar um BadRequestException limpo e amigável.
        const exerciseIds = data.exercises.map(ex => ex.exerciseId);
        const uniqueExerciseIds = new Set(exerciseIds);
        
        if (uniqueExerciseIds.size !== exerciseIds.length) {
            throw new BadRequestException('A rotina não pode conter o mesmo exercício duplicado.');
        }

        // Crítica de negócio: O usuário precisa existir
        const userExists = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        // Verifica se todos os exercícios solicitados existem no banco
        const exercisesInDb = await this.prisma.exercise.findMany({
            where: { id: { in: exerciseIds } },
        });

        if (exercisesInDb.length !== uniqueExerciseIds.size) {
            throw new BadRequestException('Um ou mais exercícios informados não existem no sistema.');
        }

        // Por que usamos 'Nested Writes' do Prisma aqui?
        // Porque o Prisma envelopa a criação da rotina e a associação dos exercícios (RoutineExercise) 
        // automaticamente dentro de uma única Transação ACID. Se um exercício falhar, a rotina não é criada.
        return this.prisma.routine.create({
            data: {
                userId: userId,
                name: data.name,
                exercises: {
                    create: data.exercises.map(ex => ({
                        exerciseId: ex.exerciseId,
                        order: ex.order,
                    })),
                },
            },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });
    }

    async findByUser(userId: string) {
        return this.prisma.routine.findMany({
            where: { userId },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async updateRoutine(
        routineId: string,
        userId: string,
        data: { name?: string; exercises?: { exerciseId: string; order: number }[] },
    ) {
        // Por que validamos o ownership da rotina aqui?
        // Para garantir a segurança de Tenancy (Multitenant). Um usuário 
        // jamais pode editar rotinas de outro usuário injetando um ID aleatório via API.
        const routine = await this.prisma.routine.findUnique({
            where: { id: routineId },
        });

        if (!routine || routine.userId !== userId) {
            throw new NotFoundException('Rotina não encontrada.');
        }

        // Por que adotamos o padrão Delete + Recreate para atualizar os exercícios?
        // Em vez de calcular diffs complexos (quem foi adicionado, reordenado ou removido na UI),
        // apagar todos os relacionamentos pivotais e recriá-los em bloco é uma operação baratíssima
        // no banco e garante integridade 100% livre de bugs de ordenação.
        if (data.exercises) {
            return this.prisma.$transaction(async (tx) => {
                // Remove exercícios antigos
                await tx.routineExercise.deleteMany({
                    where: { routineId },
                });

                // Atualiza nome + recria exercícios
                return tx.routine.update({
                    where: { id: routineId },
                    data: {
                        name: data.name ?? routine.name,
                        exercises: {
                            create: data.exercises!.map((ex) => ({
                                exerciseId: ex.exerciseId,
                                order: ex.order,
                            })),
                        },
                    },
                    include: {
                        exercises: {
                            include: { exercise: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                });
            });
        }

        // Atualiza só o nome
        return this.prisma.routine.update({
            where: { id: routineId },
            data: { name: data.name },
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }

    async deleteRoutine(routineId: string, userId: string) {
        const routine = await this.prisma.routine.findUnique({
            where: { id: routineId },
        });

        if (!routine || routine.userId !== userId) {
            throw new NotFoundException('Rotina não encontrada.');
        }

        await this.prisma.routine.delete({
            where: { id: routineId },
        });
    }
}
