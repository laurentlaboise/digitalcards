import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('short_links')
export class ShortLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  profile_id: string;

  @ManyToOne(() => Profile, (profile) => profile.short_links, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ unique: true })
  @Index()
  short_code: string;

  @Column({ unique: true, nullable: true })
  vanity_slug: string;

  @Column()
  full_url: string;

  @Column({ default: 0 })
  click_count: number;

  @CreateDateColumn()
  created_at: Date;
}
