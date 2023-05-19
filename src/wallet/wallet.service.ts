import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Wallet } from './schemas/wallet.schema'
import { Payment } from './schemas/payment.schema'
import { CreateWalletDto } from './dto/create-wallet.dto'
import { MakeOperationDto } from './dto/make-operation.dto'
import { WritePaymentDto } from './dto/write-payment.dto'

@Injectable()
export class WalletService {
	constructor(
		@InjectModel('Wallet') private readonly walletModel: Model<Wallet>,
		@InjectModel('Payment') private readonly paymentModel: Model<Payment>
	) {}

	async findByUserId(userId: Types.ObjectId) {
		const wallet = await this.walletModel.findOne({ userId })
		if (!wallet)
			throw new NotFoundException('No wallet by following user id')

		return wallet
	}

	async createWallet(dto: CreateWalletDto) {
		const { userId } = dto
		if (!userId) throw new BadRequestException('No user id provided')
		return await this.walletModel.create({ userId })
	}

	async deleteWallet(userId: Types.ObjectId) {
		const deletedWallet = await this.walletModel.findOneAndDelete({
			userId,
		})
		if (!deletedWallet)
			throw new NotFoundException('No wallet by following user id')
	}

	async makeOperation(dto: MakeOperationDto) {
		const { userId, amount, type, name } = dto
		const wallet = await this.walletModel.findOne({ userId })

		if (!wallet)
			throw new BadRequestException('No wallet by following user id')

		if (wallet.balance <= 0 && type === 'decrease') {
			throw new BadRequestException('Balance is below 0')
		}

		const balancePrev = wallet.balance

		type === 'increase'
			? (wallet.balance += amount)
			: (wallet.balance -= amount)

		const paymentId = await this.writePayment({
			amount,
			date: new Date(),
			type,
			balancePrev,
			balanceAfter: wallet.balance,
			name,
		})

		wallet.history.push(paymentId)

		await wallet.save()
	}

	// Payment Actions

	async getPayments(userId: string) {
		const wallet = await this.walletModel.findOne({ userId })
		if (!wallet)
			throw new NotFoundException('No wallet by following user id')

		return await this.paymentModel.find({ _id: { $in: wallet.history } })
	}

	private async writePayment(dto: WritePaymentDto) {
		const payment = await this.paymentModel.create(dto)
		return payment._id
	}
}
