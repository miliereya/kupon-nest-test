import { Controller, Get, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Get(':userId')
    // Auth Guard
    async getPayments(@Param('userId') userId: string) {
        return this.walletService.getPayments(userId)
    }
}
