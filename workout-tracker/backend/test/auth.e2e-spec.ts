import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

// Mock Redis globalmente para os testes E2E
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };
  });
});

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    name: 'E2E Test User',
    email: `e2e-test-${Date.now()}@example.com`,
    password: 'password123',
  };

  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    
    // É importante usar o validation pipe assim como no main.ts (se houver)
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Limpar usuário de teste do banco de dados (se for db real)
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    
    await app.close();
  });

  it('/auth/register (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe(testUser.email);
  });

  it('/auth/register (POST) - fails with existing email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409); // Conflict

    expect(response.body.message).toBe('E-mail já está em uso.');
  });

  it('/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    accessToken = response.body.accessToken; // Salvar para o teste de logout
  });

  it('/auth/login (POST) - fails with wrong password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      })
      .expect(401); // Unauthorized
      
    expect(response.body.message).toBe('Credenciais inválidas.');
  });

  it('/auth/logout (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual({ success: true });
  });
  
  it('/auth/logout (POST) - fails without token', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .expect(401);
  });
});
