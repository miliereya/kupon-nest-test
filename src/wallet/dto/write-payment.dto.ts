import { TypeOperation } from '../types'

export class WritePaymentDto {
	name: string
	date: Date
	balancePrev: number
	balanceAfter: number
	amount: number
	type: TypeOperation
}
