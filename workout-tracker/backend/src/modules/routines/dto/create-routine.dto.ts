// backend/src/modules/routines/dto/create-routine.dto.ts
import { IsString, IsUUID, IsArray, ValidateNested, ArrayMinSize, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RoutineExerciseDto {
    @IsUUID(4, { message: 'O ID do exercício deve ser um UUID válido' })
    exerciseId: string;

    @IsInt({ message: 'A ordem do exercício deve ser um número inteiro' })
    @Min(1, { message: 'A ordem deve ser no mínimo 1' })
    order: number;
}

export class CreateRoutineDto {
    @IsString({ message: 'O nome da rotina deve ser uma string' })
    name: string;

    @IsArray({ message: 'exercises deve ser um array' })
    @ArrayMinSize(1, { message: 'A rotina deve conter pelo menos um exercício' })
    @ValidateNested({ each: true })
    @Type(() => RoutineExerciseDto)
    exercises: RoutineExerciseDto[];
}
