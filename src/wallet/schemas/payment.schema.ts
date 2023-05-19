import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { TypeOperation } from '../types'

@Schema()
export class Payment {
	@Prop()
	name: string

	@Prop()
	date: Date

	@Prop()
	balancePrev: number

	@Prop()
	balanceAfter: number

	@Prop()
	amount: number

	@Prop()
	type: TypeOperation
}

export const PaymentSchema = SchemaFactory.createForClass(Payment)
