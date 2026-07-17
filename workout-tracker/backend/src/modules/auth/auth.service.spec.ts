import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';

jest.mock('ioredis');
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: '1' });
      
      const dto = { name: 'Test', email: 'test@test.com', password: 'password' };
      
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should register a new user and return tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.user.create.mockResolvedValueOnce({
        id: '1',
        name: 'Test',
        email: 'test@test.com',
        passwordHash: 'hashedpassword',
      });
      mockJwtService.sign.mockReturnValue('mockToken');

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      const dto = { name: 'Test', email: 'test@test.com', password: 'password' };
      const result = await service.register(dto);

      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mockToken');
      expect(result.refreshToken).toBe('mockToken');
      expect(result.user.id).toBe('1');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const dto = { email: 'wrong@test.com', password: 'password' };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashedpassword',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const dto = { email: 'test@test.com', password: 'wrongpassword' };

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if credentials are correct', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        passwordHash: 'hashedpassword',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mockToken');

      const dto = { email: 'test@test.com', password: 'password' };
      const result = await service.login(dto);

      expect(result.accessToken).toBe('mockToken');
      expect(result.refreshToken).toBe('mockToken');
    });
  });

  describe('logout', () => {
    it('should remove refresh_token from Redis and return success', async () => {
      const mockRedisDel = jest.fn().mockResolvedValue(1);
      (service as any).redisClient.del = mockRedisDel;

      const result = await service.logout('user123');

      expect(mockRedisDel).toHaveBeenCalledWith('refresh_token:user123');
      expect(result).toEqual({ success: true });
    });
  });
});
