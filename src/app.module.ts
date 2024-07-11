import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { loggingMiddleware, PrismaModule } from 'nestjs-prisma';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from '@prisma/client/runtime/library';
import * as process from 'process';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // TODO CORS 还未设置前端域名  http://localhost:8080
      driver: ApolloDriver,
      playground: true,
      sortSchema: true,
      // TODO autoSchemaFile 设置路径
      autoSchemaFile: 'src/schema.graphql'
    }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [
          loggingMiddleware({
            logger: new Logger('PrismaMiddleware'),
            logLevel: 'log',
          }),
        ],
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
