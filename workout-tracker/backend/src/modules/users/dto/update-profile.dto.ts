import { IsString, IsOptional, IsNumber, Min, Max, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
  @Length(2, 50, { message: 'O nome deve ter entre 2 e 50 caracteres' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'A altura deve ser um número válido' })
  @Min(50, { message: 'A altura mínima permitida é 50 cm' })
  @Max(250, { message: 'A altura máxima permitida é 250 cm' })
  height?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O peso deve ser um número válido' })
  @Min(10, { message: 'O peso mínimo permitido é 10 kg' })
  @Max(500, { message: 'O peso máximo permitido é 500 kg' })
  weight?: number;
}
