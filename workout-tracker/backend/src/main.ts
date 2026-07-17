import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Por que escolhemos o FastifyAdapter em vez do Express (padrão do NestJS)?
  // O Fastify lida com até o dobro de requisições por segundo em comparação ao Express.
  // Como nosso app logará dezenas de séries (sets) muito rapidamente durante um treino ativo,
  // precisamos de uma engine de rede com baixíssima latência e alto throughput.
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }) 
  );

  // Habilitando CORS para o nosso Front-end conseguir conversar com a API
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, ngrok-skip-browser-warning',
  });

  // Por que usamos 'whitelist' e 'forbidNonWhitelisted' de forma global?
  // Para prevenir falhas de segurança do tipo "Mass Assignment" (Atribuição em Massa).
  // Se um atacante enviar um campo malicioso (ex: isAdmin: true) no payload JSON,
  // o Validator descartará o payload e retornará erro 400 antes de chegar ao Controller.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Injetando um prefixo global nas rotas (ex: http://localhost:3000/api/workouts)
  app.setGlobalPrefix('api');

  await app.listen(3000, '0.0.0.0');
  console.log(`🚀 Back-end rodando na porta 3000 com Fastify!`);
}
bootstrap();