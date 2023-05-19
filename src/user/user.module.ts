import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UserSchema } from './user.model'
import { MongooseModule } from '@nestjs/mongoose'
import { WalletModule } from 'src/wallet/wallet.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
		WalletModule
	],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule {}
