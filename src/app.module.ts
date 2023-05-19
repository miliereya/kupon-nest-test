import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { MongooseModule } from '@nestjs/mongoose'
import { WalletModule } from './wallet/wallet.module'
import { mongoUri } from 'env'

@Module({
	imports: [UserModule, MongooseModule.forRoot(mongoUri), WalletModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
