import {
  BadRequestException,
  Controller,
  Headers,
  Logger,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import Stripe from 'stripe';
import { Public } from '../../../common/decorators/public.decorator';
import { SubscriptionsService } from '../services/subscriptions.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('stripe.secretKey'), {
      apiVersion: '2023-10-16',
    });
  }

  @Post('stripe')
  @Public()
  @ApiExcludeEndpoint()
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException(
        'Raw body is required for webhook signature verification',
      );
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.get('stripe.webhookSecret'),
      );
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Received Stripe webhook event: ${event.type}`);

    await this.subscriptionsService.handleWebhook(event);

    return { received: true };
  }
}
