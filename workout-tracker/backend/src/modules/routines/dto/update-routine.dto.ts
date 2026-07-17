import { IsString, IsUUID, IsArray, ValidateNested, ArrayMinSize, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateRoutineExerciseDto {
  @IsUUID(4, { message: 'O ID do exercício deve ser um UUID válido' })
  exerciseId: string;

  @IsInt({ message: 'A ordem do exercício deve ser um número inteiro' })
  @Min(1, { message: 'A ordem deve ser no mínimo 1' })
  order: number;
}

export class UpdateRoutineDto {
  @IsOptional()
  @IsString({ message: 'O nome da rotina deve ser uma string' })
  name?: string;

  @IsOptional()
  @IsArray({ message: 'exercises deve ser um array' })
  @ArrayMinSize(1, { message: 'A rotina deve conter pelo menos um exercício' })
  @ValidateNested({ each: true })
  @Type(() => UpdateRoutineExerciseDto)
  exercises?: UpdateRoutineExerciseDto[];
}
