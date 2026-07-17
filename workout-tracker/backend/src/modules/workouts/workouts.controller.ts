// backend/src/modules/workouts/workouts.controller.ts
import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { LogWorkoutSetDto } from './dto/log-workout-set.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
    constructor(private readonly workoutsService: WorkoutsService) { }

    // GET /api/workouts/summary
    @Get('summary')
    async getSummary(@Request() req: { user: { userId: string } }) {
        return this.workoutsService.getSummary(req.user.userId);
    }

    // GET /api/workouts/sessions/latest
    @Get('sessions/latest')
    async getLatestSession(@Request() req: { user: { userId: string } }) {
        return this.workoutsService.getLatestSession(req.user.userId);
    }

    // GET /api/workouts/sessions/:sessionId
    @Get('sessions/:sessionId')
    async getSession(@Request() req: { user: { userId: string } }, @Param('sessionId') sessionId: string) {
        return this.workoutsService.getSession(sessionId, req.user.userId);
    }

    // POST /api/workouts/sessions
    @Post('sessions')
    @HttpCode(HttpStatus.CREATED)
    async startSession(@Request() req: { user: { userId: string } }, @Body() createDto: CreateWorkoutSessionDto) {
        return this.workoutsService.createSession(req.user.userId, createDto);
    }

    // POST /api/workouts/sessions/:sessionId/sets
    @Post('sessions/:sessionId/sets')
    @HttpCode(HttpStatus.CREATED)
    async logSet(
        @Request() req: { user: { userId: string } },
        @Param('sessionId') sessionId: string,
        @Body() logDto: LogWorkoutSetDto,
    ) {
        return this.workoutsService.logSet(sessionId, req.user.userId, logDto);
    }

    // PUT /api/workouts/sessions/:sessionId/finish
    @Put('sessions/:sessionId/finish')
    async finishSession(@Request() req: { user: { userId: string } }, @Param('sessionId') sessionId: string) {
        return this.workoutsService.finishSession(sessionId, req.user.userId);
    }
}