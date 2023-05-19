import { Test, TestingModule } from '@nestjs/testing'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'
import { getModelToken } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Connection, Model, connect } from 'mongoose'
import { Wallet, WalletSchema } from './schemas/wallet.schema'
import { Payment, PaymentSchema } from './schemas/payment.schema'
import { NotFoundException } from '@nestjs/common'

describe('wallet.controller', () => {
	let controller: WalletController
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
			controllers: [WalletController],
			providers: [
				WalletService,
				{ provide: getModelToken('Wallet'), useValue: walletModel },
				{ provide: getModelToken('Payment'), useValue: paymentModel },
			],
		}).compile()

		controller = module.get<WalletController>(WalletController)
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

	describe('getPayments()', () => {
		it('should throw 404 (No wallet by following user id)', async () => {
			await expect(controller.getPayments(userId)).rejects.toThrow(
				new NotFoundException('No wallet by following user id')
			)
		})

		it('should return empty array', async () => {
			await (new walletModel({userId}).save())
			expect(await controller.getPayments(userId)).toStrictEqual([])
		})
	})
})
