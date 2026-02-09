import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { ProductsService } from '../services/products.service';
import { ProductType } from '../../../entities';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all active products' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ProductType,
    description: 'Filter by product type',
  })
  async findAll(@Query('type') type?: ProductType) {
    const filters = type ? { type } : undefined;
    return this.productsService.findAll(filters);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get product details by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }
}
