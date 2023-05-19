import { Module } from '@nestjs/common'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'
import { MongooseModule } from '@nestjs/mongoose'
import { WalletSchema } from './schemas/wallet.schema'
import { PaymentSchema } from './schemas/payment.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Wallet', schema: WalletSchema },
			{ name: 'Payment', schema: PaymentSchema },
		]),
	],
	controllers: [WalletController],
	providers: [WalletService],
	exports: [WalletService],
})
export class WalletModule {}
