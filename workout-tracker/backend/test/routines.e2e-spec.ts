import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

// Mock Redis globally for E2E tests
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };
  });
});

describe('RoutinesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let exerciseId1: string;
  let exerciseId2: string;
  let createdRoutineId: string;

  const testUser = {
    name: 'Routines E2E User',
    email: `routines-e2e-${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    
    prisma = app.get<PrismaService>(PrismaService);

    // 1. Registrar usuário de teste e obter tokens
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    accessToken = registerResponse.body.accessToken;
    userId = registerResponse.body.user.id;

    // 2. Garantir a existência de pelo menos 2 exercícios no banco de dados para os testes
    const ex1 = await prisma.exercise.upsert({
      where: { name: 'Agachamento E2E' },
      update: {},
      create: {
        name: 'Agachamento E2E',
        muscleGroup: 'Pernas',
      },
    });
    exerciseId1 = ex1.id;

    const ex2 = await prisma.exercise.upsert({
      where: { name: 'Desenvolvimento E2E' },
      update: {},
      create: {
        name: 'Desenvolvimento E2E',
        muscleGroup: 'Ombros',
      },
    });
    exerciseId2 = ex2.id;
  });

  afterAll(async () => {
    // Limpar os dados de teste gerados
    if (createdRoutineId) {
      await prisma.routine.deleteMany({
        where: { id: createdRoutineId },
      });
    }

    await prisma.user.deleteMany({
      where: { id: userId },
    });

    await prisma.exercise.deleteMany({
      where: {
        id: { in: [exerciseId1, exerciseId2] },
      },
    });

    await app.close();
  });

  it('POST /routines - should create a new routine successfully', async () => {
    const payload = {
      name: 'Treino de Pernas E2E',
      exercises: [
        {
          exerciseId: exerciseId1,
          order: 1,
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/routines')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(payload.name);
    expect(response.body.exercises).toHaveLength(1);
    expect(response.body.exercises[0].exerciseId).toBe(exerciseId1);

    createdRoutineId = response.body.id;
  });

  it('POST /routines - should fail when duplicate exercises are provided', async () => {
    const payload = {
      name: 'Treino Duplicado E2E',
      exercises: [
        {
          exerciseId: exerciseId1,
          order: 1,
        },
        {
          exerciseId: exerciseId1,
          order: 2,
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/routines')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(400);

    expect(response.body.message).toContain('A rotina não pode conter o mesmo exercício duplicado.');
  });

  it('GET /routines - should list all routines for the authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/routines')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    
    const routine = response.body.find((r: any) => r.id === createdRoutineId);
    expect(routine).toBeDefined();
    expect(routine.name).toBe('Treino de Pernas E2E');
  });

  it('PUT /routines/:id - should update the routine name and reorder exercises (Delete + Recreate)', async () => {
    const payload = {
      name: 'Treino de Pernas E2E Atualizado',
      exercises: [
        {
          exerciseId: exerciseId2, // Troca de exercício
          order: 1,
        },
        {
          exerciseId: exerciseId1,
          order: 2,
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .put(`/routines/${createdRoutineId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(200);

    expect(response.body.id).toBe(createdRoutineId);
    expect(response.body.name).toBe(payload.name);
    expect(response.body.exercises).toHaveLength(2);
    
    // Verifica a nova ordenação e exercícios associados
    expect(response.body.exercises[0].exerciseId).toBe(exerciseId2);
    expect(response.body.exercises[0].order).toBe(1);
    expect(response.body.exercises[1].exerciseId).toBe(exerciseId1);
    expect(response.body.exercises[1].order).toBe(2);
  });

  it('DELETE /routines/:id - should remove the routine and return 200 OK', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/routines/${createdRoutineId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual({ success: true });

    // Garante que o registro foi removido no banco de dados
    const dbRoutine = await prisma.routine.findUnique({
      where: { id: createdRoutineId },
    });
    expect(dbRoutine).toBeNull();
  });
});
