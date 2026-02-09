import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { LeadSubmission } from './lead-submission.entity';
import { EmailTemplate } from './email-template.entity';

@Entity('lead_forms')
export class LeadForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  profile_id: string;

  @ManyToOne(() => Profile, (profile) => profile.lead_forms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column()
  form_name: string;

  @Column({ type: 'jsonb' })
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    label: string;
    placeholder?: string;
    options?: string[];
    conditional_logic?: {
      depends_on: string;
      condition: string;
      value: string;
    };
  }>;

  @Column({ default: 'Submit' })
  submit_button_text: string;

  @Column({ nullable: true })
  confirmation_message: string;

  @Column({ default: false })
  auto_followup_enabled: boolean;

  @Column({ uuid: true, nullable: true })
  followup_template_id: string;

  @ManyToOne(() => EmailTemplate, { nullable: true })
  @JoinColumn({ name: 'followup_template_id' })
  followup_template: EmailTemplate;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => LeadSubmission, (sub) => sub.lead_form)
  submissions: LeadSubmission[];
}
