import { ApiProperty } from '@nestjs/swagger';

export class GetAllUserResponseDto {
  @ApiProperty({
    description: 'ユーザーID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ユーザー名',
    example: 'John Doe',
    minLength: 1,
  })
  name: string;

  @ApiProperty({
    description: 'メールアドレス',
    example: 'john@example.com',
    format: 'email',
  })
  email: string;
}
