import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum IntegrationType {
  ZAPIER = 'zapier',
  SALESFORCE = 'salesforce',
  HUBSPOT = 'hubspot',
  GOOGLE_WORKSPACE = 'google_workspace',
  MICROSOFT_365 = 'microsoft_365',
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true, nullable: true })
  user_id: string;

  @ManyToOne(() => User, (user) => user.integrations, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ uuid: true, nullable: true })
  organization_id: string;

  @ManyToOne(() => Organization, (org) => org.integrations, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'enum', enum: IntegrationType })
  integration_type: IntegrationType;

  @Column({ type: 'jsonb', nullable: true })
  credentials: Record<string, any>;

  @Column({ nullable: true })
  webhook_url: string;

  @Column({ default: false })
  sync_enabled: boolean;

  @Column({ nullable: true })
  last_sync_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
