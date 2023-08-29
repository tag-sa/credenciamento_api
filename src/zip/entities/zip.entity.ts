export class Zip {
  zip: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;

  constructor(
    zip: string,
    address: string,
    neighborhood: string,
    city: string,
    state: string,
  ) {
    Object.assign(this, { zip, address, neighborhood, city, state });
  }
}
