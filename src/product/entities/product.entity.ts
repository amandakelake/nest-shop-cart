import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  image: string;

  @Field()
  price: number;

  @Field()
  brand: string;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
