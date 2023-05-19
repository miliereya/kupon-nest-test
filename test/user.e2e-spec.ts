import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from './../src/app.module'
import * as request from 'supertest'

describe('User E2E Test', () => {
	let app: INestApplication

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		await app.init()
	})

	const testEmail = `test${new Date()}@mail.ru`
	const password = '12512612'
	const wrongPassword = '12512512'

	describe('Registration', () => {
		it('create new user', () => {
			return request(app.getHttpServer())
				.post('/user/create')
				.send({ email: testEmail, password })
				.expect(201)
		})

		it('status 400 while creating user with existing email', () => {
			return request(app.getHttpServer())
				.post('/user/create')
				.send({ email: testEmail, password })
				.expect(400)
		})
	})

	describe('Login', () => {
		it('login user', () => {
			return request(app.getHttpServer())
				.post('/user/login')
				.send({ email: testEmail, password })
				.expect(201)
		})

		it('status 403 with wrong credentials', () => {
			return request(app.getHttpServer())
				.post('/user/login')
				.send({ email: testEmail, password: wrongPassword })
				.expect(401)
		})
	})
})
