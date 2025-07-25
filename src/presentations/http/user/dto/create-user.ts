import { ApiProperty } from '@nestjs/swagger';
import { zodJP } from '~utils';

export const CreateUserSchema = zodJP.object({
  name: zodJP.string().min(1),
  email: zodJP.string().email(),
  password: zodJP.string().min(6),
});

export type CreateUserDto = zodJP.infer<typeof CreateUserSchema>;

export class CreateUserSwaggerDto {
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

  @ApiProperty({
    description: 'パスワード',
    example: 'password123',
    minLength: 6,
  })
  password: string;
}
