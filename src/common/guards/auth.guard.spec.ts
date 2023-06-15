import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { describe } from "node:test";
import { AuthGuard } from "./auth.guard";

describe('authGuard', () => {
  let guard: AuthGuard;
  let configService: ConfigService;
  let jwtService: JwtService;
  let secret: string = 'abcd';
  let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG4iLCJzdWIiOjEsImlhdCI6MTY4NjgxMjU2MCwiZXhwIjoyMDAyMzg4NTYwfQ.18PLXgR4WXKRux8OSPivlEDOoiJUYRQyUyQ3ksb8MGs';
  let context: any = {
    switchToHttp: () => ({
      getRequest: () => ({}),
    }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({}),
        ConfigModule.forRoot(),
      ],
      providers: [
        AuthGuard,
      ]
    }).compile();
    guard = module.get<AuthGuard>(AuthGuard);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {

    describe('should return true when', () => {
      it('jwtSecret is not defined', () => {
        jest.spyOn(configService, 'get').mockImplementation(() => undefined);
        expect(guard.canActivate({} as any)).toBe(true);
      });

      it('token is valid', () => {
        jest.spyOn(configService, 'get').mockImplementation(() => secret);
        jest.spyOn(guard as any, 'extractTokenFromHeader').mockReturnValue(token);
        expect(guard.canActivate(context)).toBe(true);
      });
    });

    describe('should throw UnauthorizedException when', () => {
      it('token is not valid', () => {
        jest.spyOn(configService, 'get').mockImplementation(() => secret);
        jest.spyOn(guard as any, 'extractTokenFromHeader').mockImplementation(() => 'invalid token');
        expect(() => guard.canActivate(context)).toThrowError('Unauthorized');
      });

      it('token is not provided', () => {
        jest.spyOn(configService, 'get').mockImplementation(() => secret);
        jest.spyOn(guard as any, 'extractTokenFromHeader').mockReturnValue(undefined);
        expect(() => guard.canActivate(context)).toThrowError('Unauthorized');
      });
    });

  });

  describe('extractTokenFromHeader', () => {
    it('should return token', () => {
      const request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      expect(guard['extractTokenFromHeader'](request as any)).toBe(token);
    });

    describe('should return undefined when', () => {
      it('authorization header is not provided', () => {
        const request = {
          headers: {},
        };
        expect(guard['extractTokenFromHeader'](request as any)).toBe(undefined);
      });

      it('authorization header is not valid', () => {
        const request = {
          headers: {
            authorization: `Basic ${token}`,
          },
        };
        expect(guard['extractTokenFromHeader'](request as any)).toBe(undefined);
      });
    });

  });

  // sign a test token
  // it('sign test token', () => {
  //   const token = jwtService.sign({ username: 'john', sub: 1 }, { secret, expiresIn: '10y' });
  //   console.log(token);
  // });

});