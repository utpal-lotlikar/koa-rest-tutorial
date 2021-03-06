import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, VersionColumn} from "typeorm";
import {BoolBitTransformer} from 'helpers/BoolBitTransformer';

@Entity()
export class Category {

    @PrimaryGeneratedColumn({
        name: "category_id"
    })
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'bit',
        default: () => `"'b'1''"`,
        transformer: new BoolBitTransformer()
    })
    enabled: boolean;

    @VersionColumn()
    version: number

    @CreateDateColumn({
        name: "date_created"
    })
    dateCreated: Date;

    @UpdateDateColumn({
        name: "last_updated"
    })
    lastUpdated: Date;

    @Column({
        name: "tenant_id"
    })
    tenantId: number;
}