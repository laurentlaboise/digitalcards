import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NFCDevice, Order, OrderStatus } from '../../../entities';
import { randomBytes } from 'crypto';

@Processor('fulfillment')
export class FulfillmentProcessor extends WorkerHost {
  private readonly logger = new Logger(FulfillmentProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(NFCDevice)
    private readonly nfcDeviceRepo: Repository<NFCDevice>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'nfc-provisioning':
        return this.provisionNFCDevices(job.data);
      case 'shipment-creation':
        return this.createShipment(job.data);
      case 'license-provisioning':
        return this.provisionLicense(job.data);
      default:
        this.logger.warn(`Unknown fulfillment job: ${job.name}`);
    }
  }

  private async provisionNFCDevices(data: {
    orderId: string;
    items: Array<{
      product_id: string;
      quantity: number;
      device_type: string;
      material: string;
      customization?: Record<string, any>;
    }>;
  }): Promise<void> {
    for (const item of data.items) {
      for (let i = 0; i < item.quantity; i++) {
        const device = this.nfcDeviceRepo.create({
          device_serial: `NFC-${randomBytes(8).toString('hex').toUpperCase()}`,
          device_type: item.device_type as any,
          material: item.material as any,
          provisioning_token: randomBytes(16).toString('hex'),
          order_id: data.orderId,
        });
        await this.nfcDeviceRepo.save(device);
      }
    }

    this.logger.log(`NFC devices provisioned for order ${data.orderId}`);
  }

  private async createShipment(data: {
    orderId: string;
    shippingAddress: {
      name: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    weight?: number;
  }): Promise<void> {
    const shippoApiKey = this.configService.get('shippo.apiKey');

    // Create shipment via Shippo API
    const shipmentResponse = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${shippoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address_from: {
          name: 'TapCard Fulfillment',
          street1: '123 Fulfillment Way',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'US',
        },
        address_to: {
          name: data.shippingAddress.name,
          street1: data.shippingAddress.line1,
          street2: data.shippingAddress.line2 || '',
          city: data.shippingAddress.city,
          state: data.shippingAddress.state,
          zip: data.shippingAddress.postal_code,
          country: data.shippingAddress.country,
        },
        parcels: [
          {
            length: '6',
            width: '4',
            height: '0.5',
            distance_unit: 'in',
            weight: String(data.weight || 2),
            mass_unit: 'oz',
          },
        ],
        async: false,
      }),
    });

    if (!shipmentResponse.ok) {
      const error = await shipmentResponse.text();
      this.logger.error(`Shippo shipment creation failed: ${error}`);
      throw new Error(`Shipment creation failed: ${error}`);
    }

    const shipment = await shipmentResponse.json();

    // Get the first available rate and create a transaction (label)
    if (shipment.rates && shipment.rates.length > 0) {
      const rate = shipment.rates[0];
      const transactionResponse = await fetch('https://api.goshippo.com/transactions/', {
        method: 'POST',
        headers: {
          'Authorization': `ShippoToken ${shippoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rate: rate.object_id,
          label_file_type: 'PDF',
          async: false,
        }),
      });

      if (transactionResponse.ok) {
        const transaction = await transactionResponse.json();
        if (transaction.tracking_number) {
          await this.orderRepo.update(
            { id: data.orderId },
            {
              tracking_number: transaction.tracking_number,
              status: OrderStatus.SHIPPED,
            },
          );
          this.logger.log(
            `Shipment created for order ${data.orderId}, tracking: ${transaction.tracking_number}`,
          );
        }
      }
    }
  }

  private async provisionLicense(data: {
    orderId: string;
    userId: string;
    productType: string;
    productId: string;
  }): Promise<void> {
    // Handle digital product provisioning (templates, domains, etc.)
    this.logger.log(
      `License provisioned for user ${data.userId}, product ${data.productId}`,
    );
  }
}
