// backend/src/modules/exercises/exercises.module.ts
import { Module } from '@nestjs/common';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ExercisesController],
    providers: [ExercisesService],
})
export class ExercisesModule {}
