import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User } from './user.model'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto'
import { WalletService } from 'src/wallet/wallet.service'

@Injectable()
export class UserService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<User>,
		private readonly walletService: WalletService
	) {}

	async register(dto: CreateUserDto) {
		const isUserExist = await this.userModel.findOne({ email: dto.email })
		if (isUserExist) throw new BadRequestException('Email already exists')

		const user = new this.userModel(dto)
		try {
			await this.walletService.createWallet({ userId: user._id })
		} catch (e) {
			throw new InternalServerErrorException(
				'Wallet service is unavailable'
			)
		}
		await user.save()
		return user
	}

	async login(dto: LoginDto) {
		const user = await this.userModel.findOne({ ...dto })
		if (!user) throw new UnauthorizedException('Wrong credentials')

		return user
	}

	async delete(userId: Types.ObjectId) {
		const user = await this.userModel.findById(userId)

		if (!user) throw new NotFoundException('No user by following id')

		try {
			await this.walletService.deleteWallet(userId)
		} catch (e) {
			throw new InternalServerErrorException(
				'Wallet service is unavailable'
			)
		}

		await this.userModel.findByIdAndDelete(userId)
	}
}
