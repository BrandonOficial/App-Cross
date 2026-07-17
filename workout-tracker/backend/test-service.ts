import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { WorkoutsService } from './src/modules/workouts/workouts.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(WorkoutsService);
  try {
    await service.createSession("5edfd386-83d4-4f41-88af-ccd6a3475f99", {});
    console.log('Success');
  } catch (e) {
    console.error('Error:', e);
  }
  await app.close();
}
bootstrap();
