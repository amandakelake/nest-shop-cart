<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Shop cart

Tech Stack: NestJS + Prisma + PostgresQL + GraphQL + Stripe + Docker-Compose

## Setup prisma + postgres with docker-compose

```sh
pnpm install prisma -D
pnpm npm install @prisma/client

# 生成 prisma.schema文件
pnpm prisma init
```

在`.env`文件配置`DATABASE_URL`
```sh
DATABASE_URL="postgresql://root:123@localhost:5432/nest_shop_cart_db?schema=public"
# 配置来自于docker-compose配置的postgres
```

```yml
version: '3.9'

services:
  postgres:
    image: postgres:latest
    ports:
      - 5432:5432
    volumes:
      - ~/apps/postgres:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=123
      - POSTGRES_USER=root
      - POSTGRES_DB=nest_shop_cart_db
```

在`prisma.schema`配置model

`docker-compose up -d`启动 postgres服务

`pnpm prisma migrate dev`初始化数据库，生成prisma client

`pnpm prisma studio`来查看数据库GUI


## nest 集成 prisma

推荐 [nestjs-prisma](https://www.npmjs.com/package/nestjs-prisma) 
```ts
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
```

做了任何schema相关的更改，记得要evolving本地的prisma client [Introduction to Prisma Client | Prisma Documentation](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction#3-importing-prisma-client)
```sh
pnpm prisma generate
```
不然代码无法识别如 `this.prisma.product.findMany()`中的model

## nest 集成 graphql
[NestJS | GraphQL - A progressive Node.js framework](https://docs.nestjs.com/graphql/quick-start#getting-started-with-graphql--typescript)

```ts
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      sortSchema: true,
      autoSchemaFile: 'src/schema.graphql',
    }),
	// ...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
```

然后执行`nest g resource product`，会自动插入product相关的代码，包括`schema.graphql`文件


## Prisma Seed
```ts
// prisma/seed.ts
// 多准备一份seed数据，放在 prisma/seedData.ts
import products from './seedData';
import { PrismaService } from 'nestjs-prisma';

const prisma = new PrismaService();

(function seed() {
  products.forEach(async (product) => {
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        brand: product.brand,
      },
    });
  });
})();
```

在`package.json`增加如下命令

```json
{
  "name": "nest-shop-cart",
  "scripts": {
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

`yarn run db:seed`初始化数据

`yarn run db:studio`查看数据表


## Stripe
https://docs.stripe.com/get-started/development-environment?lang=node
```sh
brew install stripe/stripe-cli/stripe

stripe login
```

## FrontEnd Graphql

[Introduction \(GraphQL-Codegen\)](https://the-guild.dev/graphql/codegen/docs/getting-started)


## Error
### Pnpm + Prisma 无法识别Model，无法resolve `@prisma/client`
因为pnpm的node_modules是通过软链接到全局的store，prisma client generate时没有将对应的类型文件生成到`./nodu_modules/@prisma/client`路径，导致TS无法识别对应的类型

解决方案：将pnpm换回yarn或者npm即可


## License

Nest is [MIT licensed](LICENSE).
