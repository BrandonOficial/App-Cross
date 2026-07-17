// backend/src/modules/workouts/dto/log-workout-set.dto.ts
import { IsUUID, IsNumber, IsInt, IsEnum, IsOptional, Min, Max } from 'class-validator';
// Por que importamos o Enum gerado pelo Prisma no DTO?
// Para manter uma Single Source of Truth (SSOT). Se adicionarmos um novo tipo de série no banco,
// o validador do NestJS herda a tipagem instantaneamente sem precisarmos duplicar enums.
import { SetType } from '@prisma/client';

export class LogWorkoutSetDto {
  // O ID tem que ser um UUID válido, nada de strings aleatórias
  @IsUUID(4, { message: 'O ID do exercício deve ser um UUID válido' })
  exerciseId: string;

  // A mágica: O Nest só vai aceitar se for WARMUP, FEEDER, TOP_SET, BACK_OFF ou STANDARD
  @IsEnum(SetType, {
    message: 'O tipo de série inválido. Verifique os valores permitidos.',
  })
  setType: SetType;

  // Peso não pode ser negativo e suporta casas decimais (ex: 12.5)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'O peso não pode ser negativo' })
  weight: number;

  // Repetições têm que ser números inteiros (não existe meia repetição válida no log)
  @IsInt()
  @Min(1, { message: 'Você precisa fazer pelo menos 1 repetição' })
  @Max(100, { message: 'Mais de 100 repetições? Você está fazendo cardio.' })
  reps: number;

  // Por que o RPE é opcional?
  // O RPE (Rate of Perceived Exertion) é uma métrica subjetiva avançada (escala de 1 a 10).
  // Usuários iniciantes raramente utilizam, então torná-lo obrigatório reduziria a conversão e o engajamento.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rpe?: number;
}