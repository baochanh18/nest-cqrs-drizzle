import { ApiPropertyOptional } from '@nestjs/swagger';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '~configs';

export class GetAllUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (starting from 1)',
    example: 1,
    minimum: 1,
    default: DEFAULT_PAGE,
  })
  page?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: DEFAULT_PAGE_LIMIT,
  })
  limit?: string;
}
