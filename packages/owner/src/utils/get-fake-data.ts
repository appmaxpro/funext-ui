import type { Db } from "data-generator-retail";
import {fetch} from './client';

let data: Db | null = null;
let request: Promise<Db> | null = null;

export async function getFakeData(): Promise<Db> {
  if (data) {
    return Promise.resolve(data);
  }
  if (request) {
    return request;
  }

  return (request = fetch({
    url: 'api/data/fake'
  })
  .then(async(res) =>  {
    data = (await res.json()) as Db;
    return Promise.resolve<Db>(data);
  }));
}
