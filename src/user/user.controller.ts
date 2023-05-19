import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto'
import { Types } from 'mongoose'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('create')
	async create(@Body() dto: CreateUserDto) {
		return await this.userService.register(dto)
	}

	@Post('login')
	async login(@Body() dto: LoginDto) {
		return await this.userService.login(dto)
	}

	@Delete(':id')
	async delete(@Param('id') id: Types.ObjectId) {
		return await this.userService.delete(id)
	}
}
