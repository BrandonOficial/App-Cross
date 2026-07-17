import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const dto = { name: 'Test', email: 'test@test.com', password: 'password123' };
      const expectedResult = { user: { id: '1', email: 'test@test.com', name: 'Test' }, accessToken: 'token', refreshToken: 'refresh' };
      
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      const expectedResult = { user: { id: '1', email: 'test@test.com', name: 'Test' }, accessToken: 'token', refreshToken: 'refresh' };
      
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with userId and return success', async () => {
      const req = { user: { userId: 'user-id' } };
      const expectedResult = { success: true };

      mockAuthService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout(req);

      expect(authService.logout).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(expectedResult);
    });
  });
});
