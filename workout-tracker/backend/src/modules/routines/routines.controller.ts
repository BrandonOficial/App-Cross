// backend/src/modules/routines/routines.controller.ts
import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('routines')
@UseGuards(JwtAuthGuard)
export class RoutinesController {
    constructor(private readonly routinesService: RoutinesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createRoutine(@Request() req: { user: { userId: string } }, @Body() createDto: CreateRoutineDto) {
        return this.routinesService.createRoutine(req.user.userId, createDto);
    }

    @Get()
    async findRoutines(@Request() req: { user: { userId: string } }) {
        const userId = req.user.userId;
        return this.routinesService.findByUser(userId);
    }

    @Put(':id')
    async updateRoutine(
        @Request() req: { user: { userId: string } },
        @Param('id') id: string,
        @Body() data: UpdateRoutineDto,
    ) {
        return this.routinesService.updateRoutine(id, req.user.userId, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteRoutine(
        @Request() req: { user: { userId: string } },
        @Param('id') id: string,
    ) {
        await this.routinesService.deleteRoutine(id, req.user.userId);
        return { success: true };
    }
}
