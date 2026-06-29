# Testing skill

Use this when writing any test file (NestJS + Mongoose).

## E2E test setup template

import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';

describe('[Feature]', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    process.env.JWT_SECRET = 'test-secret';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // seed minimal data, then log in
    const admin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: '123456' });
    adminToken = admin.body.data.accessToken;            // note: data.accessToken

    const cust = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'user1@gmail.com', password: '123456' });
    customerToken = cust.body.data.accessToken;
  });

  afterAll(async () => { await app.close(); await mongo.stop(); });
});

## Assertion checklist for every test

- expect(res.status).toBe(exactCode)
- assert the body shape: `{ success, message, data }` (or `{ statusCode, message }`
  for errors; `{ data, total, page, totalPages }` for the product list)
- Side-effect tests: query the DB/endpoint after the action and assert state changed

## The five tests every critical endpoint needs

1. Happy path with valid auth → 200/201 + correct body shape
2. No token → 401
3. Customer token on an admin route → 403
4. Missing/invalid required field → 400 with message
5. Edge case specific to the feature (e.g. checkout with qty > stock → 400,
   stock unchanged; bad paymentToken → 402)

## Notes for this stack

- Use an in-memory Mongo (mongodb-memory-server); never the dev DB
- Routes are under the `/api` prefix; login returns the JWT at `res.body.data.accessToken`
- Unit tests can mock the Mongoose model via
  `{ provide: getModelToken(Model.name), useValue: mockModel }` (see
  products.service.spec.ts)
