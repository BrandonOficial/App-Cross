// backend/src/modules/exercises/exercises.controller.ts
import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
    constructor(private readonly exercisesService: ExercisesService) {}

    // GET /api/exercises?muscleGroup=Chest&search=bench
    @Get()
    async findAll(
        @Query('muscleGroup') muscleGroup?: string,
        @Query('search') search?: string,
    ) {
        return this.exercisesService.findAll({ muscleGroup, search });
    }

    // POST /api/exercises
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateExerciseDto) {
        return this.exercisesService.create(createDto);
    }

    // DELETE /api/exercises/:id
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string) {
        await this.exercisesService.delete(id);
        return { success: true };
    }
}
