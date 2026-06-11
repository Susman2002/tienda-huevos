import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common'
import { CustomersService } from './customers.service'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto)
  }

  @Get()
  @Roles('ADMIN', 'SELLER')
  findAll() {
    return this.customersService.findAll()
  }

  @Get('deleted')
  @Roles('ADMIN')
  findDeleted() {
    return this.customersService.findDeleted()
  }

  @Get(':id')
  @Roles('ADMIN', 'SELLER')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(id)
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto)
  }

  @Delete(':id')
  @Roles('ADMIN')
  softDelete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.customersService.softDelete(id, user.id)
  }

  @Patch(':id/restore')
  @Roles('ADMIN')
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.restore(id)
  }
}