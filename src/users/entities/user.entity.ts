import { Address } from './address.entity';

export class User {
  id?: number;
  name: string;
  nickname: string;
  email: string;
  cpf?: string;
  cnpj?: string;
  type?: string;
  rg?: string;
  rg_emitted_by?: string;
  password?: string;
  gender?: string;
  birthdate?: Date;
  status?: string;
  root?: boolean;
  created?: Date;
  modified?: Date;
  recovery_code?: string;
  recovery_code_expires?: Date;
  change_password?: boolean;
  last_login?: Date;
  last_ip?: string;
  last_access?: Date;
  address?: Address[];
}
