import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /api/products          → todos
  // GET /api/products?active=true → solo activos
  @Get()
  findAll(@Query('active') active?: string) {
    return this.productsService.findAll(active === 'true')
  }

  // GET /api/products/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id)
  }

  // POST /api/products
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  // PATCH /api/products/:id
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto)
  }

  // PATCH /api/products/:id/toggle
  @Patch(':id/toggle')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.toggleActive(id)
  }
}