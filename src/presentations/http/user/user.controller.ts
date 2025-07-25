import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '@third-party-modules';
import { CreateUserCommand } from '~use-cases';
import {
  CreateUserDto,
  CreateUserSchema,
  CreateUserSwaggerDto,
} from './dto/create-user';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('samples')
  @ApiBody({ type: CreateUserSwaggerDto })
  @ApiResponse({
    status: 201,
    description: '作成成功',
  })
  @ApiBadRequestResponse({ description: 'バリデーションエラー' })
  @ApiInternalServerErrorResponse({
    description: 'サーバーエラー',
  })
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async sample(@Body() body: CreateUserDto): Promise<void> {
    const command = new CreateUserCommand({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    await this.commandBus.execute(command);
  }
}
