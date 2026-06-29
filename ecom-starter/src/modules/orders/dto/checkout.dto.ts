import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({
    example: 'tok_test_success',
    description: 'Mock payment token. Use "tok_test_success" to simulate success.',
  })
  @IsString()
  @IsNotEmpty()
  paymentToken: string;
}
