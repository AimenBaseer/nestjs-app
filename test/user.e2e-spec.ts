import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpStatus, INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';

import { AppModule } from '../src/app.module';
import { Role, User, UserSchema } from '../src/user/user.model';
import { UserService } from '../src/user/user.service';
import { userStub } from './stubs/user.stub';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { AuthService } from '../src/auth/auth.service';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = await MongoMemoryServer.create();
      const mongoUri = await mongod.getUri();

      return {
        uri: mongoUri,
        dbName: 'test',
        ...options,
      };
    },
  });

export const closeInMongodConnection = async () => {
  if (mongod) await mongod.stop();
};

describe('User Controller (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let authService: AuthService;
  let token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        await rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
      providers: [UserService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          return true;
        },
      })
      .compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);

    app = module.createNestApplication();
    await app.init();

    const advisorStub = userStub(Role.advisor);
    const user = await userService.createUser(advisorStub);
    const auth = await authService.login(user);
    token = auth.access_token;
  });

  afterAll(async () => {
    closeInMongodConnection();
  });

  describe('users endpoints', () => {
    let user: User;
    beforeEach(async () => {
      user = await userService.createUser(userStub(Role.advisor));
    });

    it('create with that does not already exist', async () => {
      const result = await request(app.getHttpServer())
        .post('/user/0')
        .set('Authorization', `Bearer ${token}`)
        .send(userStub());
      const { status, text } = result;
      const { success } = JSON.parse(text);

      expect(status).toBe(HttpStatus.CREATED);
      expect(success).toBe(true);
    });
    it('create user with email that already exists', async () => {
      const userData = userStub();
      userData.email = user.email;
      const result = await request(app.getHttpServer())
        .post('/user/0')
        .set('Authorization', `Bearer ${token}`)
        .send(userData);

      const { status, text } = result;
      const { success } = JSON.parse(text);

      expect(status).toBe(HttpStatus.CONFLICT);
      expect(success).toBe(false);
    });

    it('update user with existing id', async () => {
      const userData = { status_id: '3' };
      const result = await request(app.getHttpServer())
        .post(`/user/${user._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(userData);

      const { status, text } = result;
      const { success, response } = JSON.parse(text);

      expect(status).toBe(HttpStatus.CREATED);
      expect(response.status_id).toBe(userData.status_id);
      expect(success).toBe(true);
    });

    it('update user with id that does not exist in the system', async () => {
      const userData = userStub();
      userData.status_id = '3';
      userData._id = new mongoose.Types.ObjectId();
      const result = await request(app.getHttpServer())
        .post(`/user/${userData._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(userData);

      const { status, text } = result;
      const { success } = JSON.parse(text);

      expect(status).toBe(HttpStatus.NOT_FOUND);
      expect(success).toBe(false);
    });
    it('get user with ID that exists in system', async () => {
      const result = await request(app.getHttpServer())
        .get(`/user/${user._id}`)
        .set('Authorization', `Bearer ${token}`);

      const { status, text } = result;
      const { success } = JSON.parse(text);

      expect(status).toBe(HttpStatus.OK);
      expect(success).toBe(true);
    });
    it('Get user with ID that does not exist in the system', async () => {
      const id=new mongoose.Types.ObjectId();
      const result = await request(app.getHttpServer())
        .get(`/user/${id}`)
        .set('Authorization', `Bearer ${token}`);

      const { status, text } = result;
      const { success } = JSON.parse(text);

      expect(status).toBe(HttpStatus.NOT_FOUND);
      expect(success).toBe(false);
    });

    it('delete user with ID that exists in system', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/user/${user._id}`)
        .set('Authorization', `Bearer ${token}`);

      const { status, text } = result;
      const { success } = JSON.parse(text);

      expect(status).toBe(HttpStatus.OK);
      expect(success).toBe(true);
    });
    it('Get all users', async () => {
      const result = await request(app.getHttpServer())
        .get(`/user/`)
        .set('Authorization', `Bearer ${token}`);

      const { status, text } = result;
      const { success, response } = JSON.parse(text);

      expect(status).toBe(HttpStatus.OK);
      expect(success).toBe(true);
      expect(response.length).toBeGreaterThan(0);
    });
    
  });
});
