import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '@third-party-modules';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '~configs';
import { CreateUserCommand, GetAllUsersQuery } from '~use-cases';
import {
  CreateUserDto,
  CreateUserSchema,
  CreateUserSwaggerDto,
} from './request-dto/create-user';
import { GetAllUsersQueryDto } from './request-dto/get-all-users-query';
import { GetAllUserResponseDto } from './response-dto/get-all-users';

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

  @Get('all')
  @ApiResponse({
    status: 200,
    description: 'Get all users with pagination',
    type: [GetAllUserResponseDto],
  })
  async getAllUsers(
    @Query() queryParams: GetAllUsersQueryDto,
  ): Promise<GetAllUserResponseDto[]> {
    const {
      page = DEFAULT_PAGE.toString(),
      limit = DEFAULT_PAGE_LIMIT.toString(),
    } = queryParams;

    const query = new GetAllUsersQuery(parseInt(page, 10), parseInt(limit, 10));
    return this.queryBus.execute(query);
  }
}
