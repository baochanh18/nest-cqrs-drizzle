import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserCommand } from '~use-cases';
import { CreateUserDto, CreateUserSchema } from './dto/create-user';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('samples')
  @ApiResponse({
    status: 201,
    description: 'Created successfully',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  async sample(@Body() body: CreateUserDto): Promise<void> {
    const result = CreateUserSchema.safeParse(body);
    if (!result.success) {
      // You can format the error as needed
      throw new BadRequestException(result.error.errors);
    }
    const command = new CreateUserCommand({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    await this.commandBus.execute(command);
  }
}
