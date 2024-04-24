import { Controller, Get, Param } from '@nestjs/common';
import { DefaultResponseDto } from 'src/dto/DefaultResponse.dto';
import { ErrorHandler } from 'src/dto/ErrorHandler.enum';

@Controller('auth')
export class AuthController {
  @Get(':id')
  getAccount(@Param('id') id: string): DefaultResponseDto<boolean> {
    const response = new DefaultResponseDto<boolean>();
    if (id === 'AVL-431') {
      response.data = true;
      response.message = 'Account is available';
      response.resultCode = '0000';
    } else {
      response.data = false;
      response.message = ErrorHandler.AU0001;
      response.resultCode = 'AU0001';
    }
    return response;
  }
}
