import { Test, TestingModule } from '@nestjs/testing'
import { WalletService } from './wallet.service'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Connection, Model, Types, connect } from 'mongoose'
import { Wallet, WalletSchema } from './schemas/wallet.schema'
import { Payment, PaymentSchema } from './schemas/payment.schema'
import { getModelToken } from '@nestjs/mongoose'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { MakeOperationDto } from './dto/make-operation.dto'

describe('wallet.service', () => {
	let service: WalletService
	let mongod: MongoMemoryServer
	let mongoConnection: Connection
	let walletModel: Model<Wallet>
	let paymentModel: Model<Payment>

	const userId = '6465873ad1b0fbf3cfc2b5c7'

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create()
		const uri = mongod.getUri()
		mongoConnection = (await connect(uri)).connection
		walletModel = mongoConnection.model('Wallet', WalletSchema)
		paymentModel = mongoConnection.model('Payment', PaymentSchema)
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				WalletService,
				{ provide: getModelToken('Wallet'), useValue: walletModel },
				{ provide: getModelToken('Payment'), useValue: paymentModel },
			],
		}).compile()

		service = module.get<WalletService>(WalletService)
	})

	afterAll(async () => {
		await mongoConnection.dropDatabase()
		await mongoConnection.close()
		await mongod.stop()
	})

	afterEach(async () => {
		const collections = mongoConnection.collections
		for (const key in collections) {
			const collection = collections[key]
			await collection.deleteMany({})
		}
	})

	describe('createWallet()', () => {
		it('should create wallet', async () => {
			const wallet = await service.createWallet({
				userId: userId as unknown as Types.ObjectId,
			})
			expect(wallet.userId).toStrictEqual(userId)
		})

		it('should throw 400 (No user id provided)', async () => {
			await expect(
				service.createWallet({
					userId: null,
				})
			).rejects.toThrow(new BadRequestException('No user id provided'))
		})
	})

	describe('deleteWallet()', () => {
		it('should delete wallet', async () => {
			await service.createWallet({
				userId: userId as unknown as Types.ObjectId,
			})
			await service.deleteWallet(userId as unknown as Types.ObjectId)

			await expect(
				service.findByUserId(userId as unknown as Types.ObjectId)
			).rejects.toThrow(
				new NotFoundException('No wallet by following user id')
			)
		})

		it('should throw 400 (No wallet by following user id)', async () => {
			await expect(
				service.deleteWallet(
					'wrong-user-id' as unknown as Types.ObjectId
				)
			).rejects.toThrow(
				new NotFoundException('No wallet by following user id')
			)
		})
	})

	describe('getPayments()', () => {
		it('should throw 404 (No wallet by following user id)', async () => {
			await expect(service.getPayments(userId)).rejects.toThrow(
				new NotFoundException('No wallet by following user id')
			)
		})

		it('should return empty array', async () => {
			await service.createWallet({
				userId: userId as unknown as Types.ObjectId,
			})
			expect(await service.getPayments(userId)).toStrictEqual([])
		})
	})

	describe('makeOperation()', () => {
		const makeOperationDto: MakeOperationDto = {
			amount: 10,
			name: 'operation name',
			type: 'decrease',
			userId,
		}

		it('should throw 404 (No wallet by following user id)', async () => {
			await expect(
				service.makeOperation(makeOperationDto)
			).rejects.toThrow(
				new NotFoundException('No wallet by following user id')
			)
		})

		it('should throw 400 (Balance is below 0)', async () => {
			await service.createWallet({
				userId: userId as unknown as Types.ObjectId,
			})
			await expect(
				service.makeOperation(makeOperationDto)
			).rejects.toThrow(new BadRequestException('Balance is below 0'))
		})

		it('should increase wallet balance by 10', async () => {
			await service.createWallet({
				userId: userId as unknown as Types.ObjectId,
			})
			await service.makeOperation({
				...makeOperationDto,
				type: 'increase',
			})
			const wallet = await service.findByUserId(
				userId as unknown as Types.ObjectId
			)
			expect(wallet.balance).toStrictEqual(10)
		})
	})
})
