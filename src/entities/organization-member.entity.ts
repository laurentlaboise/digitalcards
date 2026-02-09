import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum OrgRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Entity('organization_members')
export class OrganizationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  organization_id: string;

  @ManyToOne(() => Organization, (org) => org.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.organization_memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: OrgRole, default: OrgRole.VIEWER })
  role: OrgRole;

  @Column({ type: 'uuid', nullable: true })
  invited_by_user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invited_by_user_id' })
  invited_by: User;

  @CreateDateColumn()
  invited_at: Date;

  @Column({ nullable: true })
  joined_at: Date;

  @Column({ nullable: true })
  invite_token: string;

  @Column({ nullable: true })
  invite_email: string;
}
