import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {

  console.log('envs', envs.natsServers)


  const logger = new Logger('main');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule, 
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      }
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen();
  logger.log('Products Microservice is running in Port: ', envs.port)
}
bootstrap();
