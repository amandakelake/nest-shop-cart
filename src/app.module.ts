import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { loggingMiddleware, PrismaModule } from 'nestjs-prisma';

@Module({
  imports: [PrismaModule.forRoot({
    isGlobal: true,
    prismaServiceOptions: {
      middlewares: [
        loggingMiddleware({
          logger: new Logger('PrismaMiddleware'),
          logLevel: 'log',
        }),
      ],
    },
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
