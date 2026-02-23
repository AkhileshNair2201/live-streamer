import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ApiGatewayModule } from './../src/api-gateway.module';
import { ApiGatewayService } from './../src/api-gateway.service';

describe('ApiGatewayController (e2e)', () => {
  let app: INestApplication<App>;
  let apiGatewayService: ApiGatewayService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    apiGatewayService = app.get<ApiGatewayService>(ApiGatewayService);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/videos/:id (GET)', async () => {
    jest.spyOn(apiGatewayService, 'getVideoStatus').mockResolvedValueOnce({
      id: 'video-1',
      status: 'PENDING',
      hlsPath: null,
    });

    return request(app.getHttpServer())
      .get('/videos/video-1')
      .expect(200)
      .expect({
        id: 'video-1',
        status: 'PENDING',
        hlsPath: null,
      });
  });

  it('/videos (GET)', async () => {
    jest.spyOn(apiGatewayService, 'getVideos').mockResolvedValueOnce([
      {
        id: 'video-1',
        status: 'PENDING',
        hlsPath: null,
        storageKey: 'x',
        originalFileName: 'a.mp4',
      },
    ]);

    return request(app.getHttpServer())
      .get('/videos')
      .expect(200)
      .expect([
        {
          id: 'video-1',
          status: 'PENDING',
          hlsPath: null,
          storageKey: 'x',
          originalFileName: 'a.mp4',
        },
      ]);
  });
});
