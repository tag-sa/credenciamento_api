import { HttpService } from '@nestjs/axios';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { ZipPipe } from 'src/pipes/CepValidatonPipe';
import { Zip } from './entities/zip.entity';

@Controller('zip')
export class ZipController {
  constructor(private readonly httpService: HttpService) {}

  @Get(':zip')
  async findOne(
    @Param('zip', ZipPipe) zip: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const envKey = process.env.BUSCA_CEP_KEY;
    const endpoint = `https://cep.hub.tagsa.com.br/cep/${zip}/${envKey}`;

    try {
      const getData = await firstValueFrom(this.httpService.get(endpoint));

      if (getData.data.retorno == 'erro') {
        return response.status(HttpStatus.NOT_FOUND).json({
          message: ['zip code not found'],
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      return {
        status: true,
        data: new Zip(
          zip,
          getData.data.Endereco.nome,
          getData.data.Bairro.nome,
          getData.data.Cidade.nome,
          getData.data.Estado.nome,
        ),
      };
    } catch (error) {
      throw new ServiceUnavailableException();
    }
  }
}
