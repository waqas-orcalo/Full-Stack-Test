import { ApiProperty } from '@nestjs/swagger';

/**
 * Consistent envelope for every successful API response.
 * Mirrors the COSMONYX-BE-001 `ApiResponseDto` convention so clients always
 * receive the same shape: { success, message, data }.
 */
export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiProperty()
  data: T;

  constructor(data: T, message = 'Operation completed successfully') {
    this.success = true;
    this.message = message;
    this.data = data;
  }

  static of<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto<T>(data, message);
  }
}
