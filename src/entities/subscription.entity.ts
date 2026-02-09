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

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
}

export enum SubscriptionPlan {
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true, nullable: true })
  user_id: string;

  @ManyToOne(() => User, (user) => user.subscriptions, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ uuid: true, nullable: true })
  organization_id: string;

  @ManyToOne(() => Organization, (org) => org.subscriptions, {
    nullable: true,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ unique: true })
  @Index()
  stripe_subscription_id: string;

  @Column({ type: 'enum', enum: SubscriptionPlan })
  tier: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'timestamptz' })
  current_period_start: Date;

  @Column({ type: 'timestamptz' })
  current_period_end: Date;

  @Column({ default: 1 })
  seats_included: number;

  @Column({ default: 0 })
  seats_used: number;

  @Column({ type: 'jsonb', nullable: true })
  usage_quotas: {
    profiles: number;
    analytics_retention_days: number;
    storage_gb: number;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  cancelled_at: Date;
}
