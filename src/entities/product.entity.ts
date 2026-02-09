import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductType {
  NFC_CARD = 'nfc_card',
  NFC_TAG = 'nfc_tag',
  TEMPLATE = 'template',
  DOMAIN = 'domain',
  SUBSCRIPTION = 'subscription',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ProductType })
  product_type: ProductType;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ nullable: true })
  stripe_price_id: string;

  @Column({ nullable: true })
  inventory_count: number;

  @Column({ type: 'jsonb', nullable: true })
  customization_options: {
    engraving?: boolean;
    materials?: string[];
    colors?: string[];
    sizes?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  images: string[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
