// backend/src/modules/workouts/dto/create-workout-session.dto.ts
import { IsUUID, IsOptional } from 'class-validator';

export class CreateWorkoutSessionDto {
    // O treino pode ser atrelado a uma Rotina (Push/Pull) ou ser "Free Style" (nulo)
    @IsOptional()
    @IsUUID(4)
    routineId?: string;
}