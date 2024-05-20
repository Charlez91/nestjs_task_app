import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "<h1>Welcome to the Niyo Task Management App</h1>"', () => {
      expect(appController.getHello()).toBe('<h1>Welcome to the Niyo Task Management App</h1>');
    });
  });
});
