import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true, nullable: true })
  organization_id: string;

  @ManyToOne(() => Organization, (org) => org.email_templates, {
    nullable: true,
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  template_name: string;

  @Column()
  subject_line: string;

  @Column({ type: 'text' })
  body_html: string;

  @Column({ type: 'text', nullable: true })
  body_text: string;

  @Column({ type: 'jsonb', nullable: true })
  variables: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
