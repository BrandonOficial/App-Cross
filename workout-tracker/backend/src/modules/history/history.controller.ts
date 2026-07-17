// backend/src/modules/history/history.controller.ts
import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    // Rota: GET /api/history/sessions
    @Get('sessions')
    async getSessions(@Request() req: { user: { userId: string } }) {
        const userId = req.user.userId;
        return this.historyService.getSessionsHistory(userId);
    }

    // Rota: GET /api/history/exercises/:exerciseId/progress
    @Get('exercises/:exerciseId/progress')
    async getProgress(
        @Param('exerciseId') exerciseId: string,
        @Request() req: { user: { userId: string } },
    ) {
        const userId = req.user.userId;
        return this.historyService.getExerciseProgress(userId, exerciseId);
    }
}
