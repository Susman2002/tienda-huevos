import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import helmet from 'helmet'
import compression from 'compression'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(helmet())
  app.use(compression())

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.enableCors({
  origin: [
    process.env.FRONTEND_URL ?? 'http://localhost:5173',
    'https://tienda-huevos.vercel.app',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
})

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`🚀 Server running on http://localhost:${port}/api`)
}

bootstrap()