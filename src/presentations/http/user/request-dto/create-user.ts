import { ApiProperty } from '@nestjs/swagger';
import { VALIDATION_RULES } from '~configs';
import { zodJP } from '~utils';

export const CreateUserSchema = zodJP.object({
  name: zodJP.string().min(VALIDATION_RULES.MIN_NAME_LENGTH),
  email: zodJP.string().email(),
  password: zodJP.string().min(VALIDATION_RULES.MIN_PASSWORD_LENGTH),
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
