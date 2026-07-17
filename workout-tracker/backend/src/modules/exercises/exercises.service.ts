// backend/src/modules/exercises/exercises.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExercisesService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(filters: { muscleGroup?: string; search?: string }) {
        const where: Prisma.ExerciseWhereInput = {};

        if (filters.muscleGroup) {
            where.muscleGroup = {
                equals: filters.muscleGroup,
                mode: 'insensitive',
            };
        }

        if (filters.search) {
            where.name = {
                contains: filters.search,
                mode: 'insensitive',
            };
        }

        return this.prisma.exercise.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }

    async create(data: CreateExerciseDto) {
        try {
            return await this.prisma.exercise.create({
                data: {
                    name: data.name,
                    muscleGroup: data.muscleGroup,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException(`O exercício "${data.name}" já existe.`);
            }
            throw error;
        }
    }

    async delete(id: string) {
        try {
            await this.prisma.exercise.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(`Exercício não encontrado.`);
                }
                if (error.code === 'P2003') {
                    throw new ConflictException(`Exercício está em uso em rotinas ou treinos e não pode ser removido.`);
                }
            }
            throw error;
        }
    }
}
