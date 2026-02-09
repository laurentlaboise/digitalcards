import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum OrderType {
  HARDWARE = 'hardware',
  SUBSCRIPTION = 'subscription',
  DIGITAL = 'digital',
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FULFILLED = 'fulfilled',
  SHIPPED = 'shipped',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  organization_id: string;

  @ManyToOne(() => Organization, (org) => org.orders, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ unique: true, nullable: true })
  @Index()
  stripe_checkout_session_id: string;

  @Column({ nullable: true })
  stripe_payment_intent_id: string;

  @Column({ type: 'enum', enum: OrderType })
  order_type: OrderType;

  @Column({ type: 'jsonb' })
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    price: number;
    customization?: Record<string, any>;
  }>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipping: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'usd' })
  currency: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'jsonb', nullable: true })
  shipping_address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };

  @Column({ nullable: true })
  tracking_number: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  fulfilled_at: Date;
}
