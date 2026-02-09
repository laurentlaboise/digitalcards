import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';
import { LeadForm } from './lead-form.entity';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
  ARCHIVED = 'archived',
}

@Entity('lead_submissions')
export class LeadSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  lead_form_id: string;

  @ManyToOne(() => LeadForm, (form) => form.submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lead_form_id' })
  lead_form: LeadForm;

  @Column('uuid')
  @Index()
  profile_id: string;

  @ManyToOne(() => Profile, (profile) => profile.lead_submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ type: 'jsonb' })
  submission_data: Record<string, any>;

  @Column({ nullable: true })
  source_ip: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ type: 'jsonb', nullable: true })
  geolocation: {
    country?: string;
    city?: string;
    lat?: number;
    lng?: number;
  };

  @Column({ type: 'timestamptz' })
  submitted_at: Date;

  @Column({ nullable: true })
  followup_sent_at: Date;

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  enrichment_data: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
