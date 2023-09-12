import { HttpService } from '@nestjs/axios';
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ZipPipe } from 'src/pipes/CepValidatonPipe';
import { Zip } from './entities/zip.entity';

@Controller('zip')
export class ZipController {
  constructor(private readonly httpService: HttpService) {}

  @Get(':zip')
  async findOne(@Param('zip', ZipPipe) zip: string) {
    const envKey = process.env.BUSCA_CEP_KEY;
    const endpoint = `https://cep.hub.tagsa.com.br/cep/${zip}/${envKey}`;

    const getData = await firstValueFrom(this.httpService.get(endpoint));

    if (getData.data.retorno == 'erro') {
      throw new NotFoundException('Zip code not found');
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
  }
}
