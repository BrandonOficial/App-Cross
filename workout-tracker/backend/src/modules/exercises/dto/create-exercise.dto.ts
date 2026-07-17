// backend/src/modules/exercises/dto/create-exercise.dto.ts
import { IsString, MinLength } from 'class-validator';

export class CreateExerciseDto {
    @IsString()
    @MinLength(2, { message: 'O nome do exercício precisa ter pelo menos 2 caracteres.' })
    name: string;

    @IsString()
    @MinLength(2, { message: 'O grupo muscular precisa ter pelo menos 2 caracteres.' })
    muscleGroup: string;
}
