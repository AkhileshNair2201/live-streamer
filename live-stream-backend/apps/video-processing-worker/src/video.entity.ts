import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VideoStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity({ name: 'videos' })
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_file_name' })
  originalFileName: string;

  @Column({ name: 'storage_key', unique: true })
  storageKey: string;

  @Column({ type: 'varchar', length: 32 })
  status: VideoStatus;

  @Column({ name: 'hls_path', type: 'text', nullable: true })
  hlsPath: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
