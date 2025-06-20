import { ApiProperty } from '@nestjs/swagger';
import { zodJP } from '~utils';

export const CreateUserSchema = zodJP.object({
  name: zodJP.string().min(1),
  email: zodJP.string().email(),
  password: zodJP.string().min(6),
});

export class CreateUserDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
