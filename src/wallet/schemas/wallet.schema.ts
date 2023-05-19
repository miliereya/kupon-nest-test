import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Wallet {
	@Prop({ unique: true })
	userId: string

	@Prop({ default: 0 })
	balance: number

	@Prop({ type: Types.ObjectId, ref: 'Payment', default: [] })
	history: Types.ObjectId[]
}

export const WalletSchema = SchemaFactory.createForClass(Wallet)
