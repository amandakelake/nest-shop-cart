import { Injectable } from '@nestjs/common';
import { CreatePaymentInput } from './dto/create-payment.input';
import { UpdatePaymentInput } from './dto/update-payment.input';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_PRIVATE'), {
      apiVersion: '2024-06-20',
    });
  }

  async createCheckoutSession(items: Array<{ id: number; quantity: number }>) {
    const storedItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.id },
        });
        return {
          price_data: {
            currency: 'usd',
            product_data: { name: product.name },
            unit_amount: product.price * 100,
          },
          quantity: item.quantity,
        };
      }),
    );
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: storedItems,
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
    return { url: session.url };
  }
}
