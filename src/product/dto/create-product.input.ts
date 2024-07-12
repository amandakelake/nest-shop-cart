import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
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
}
