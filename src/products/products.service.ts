import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService {

  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto
    });

    return product;
  }

  async findAll(paginationDto: PaginationDto) {

    const { page, limit } = paginationDto;
    const totalPages = await this.prisma.product.count({ where: { available: true } });
    const lastPage = Math.ceil( totalPages / limit );

    return {
      data: await this.prisma.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          id: 'asc',
        },
        where: { available: true }
      }),
      meta: {
        total: totalPages,
        page,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, available: true }
    });

    if (!product) {
      throw new RpcException({ 
        status: HttpStatus.BAD_REQUEST, 
        message: `Product with ID ${id} not found`
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    
    const { id: __, ...data } = updateProductDto;
    
    await this.findOne(id);

    // Esto es posible porque cuando se termina la promesa 
    // es que el endpoint responde
    return this.prisma.product.update({
      where: { id },
      data: data
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    
    // Esto es posible porque cuando se termina la promesa 
    // es que el endpoint responde
    // Esto se conoce como HARD DELETE
    // return this.prisma.product.delete({
    //   where: { id }
    // });

    // Esto se conoco como SOFT DELETE
    return this.prisma.product.update({
      where: {id},
      data: {
        available: false
      }
    });
  }
}
