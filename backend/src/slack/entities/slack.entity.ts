import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity('slack_installation')
export class SlackInstallation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "user_id" })
    userId: string;

    @Column({ name: "slack_team_id" })
    slackTeamId: string;

    @Column({ name: "slack_team_name" })
    slackTeamName: string;

    @Column({ name: "slack_user_id" })
    slackUserId: string;

    @Column({ name: "bot_token" })
    botToken: string;

    @Column({ name: "user_token" })
    userToken: string;

    @Column({ name: "is_active", type: "boolean", default: true })
    isActive: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

}

