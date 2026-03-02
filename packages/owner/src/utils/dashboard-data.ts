import type { Db } from "data-generator-retail";
import {fetch} from './client';
import { getHeaders } from "./session";


let data: Db | null = null;
let request: Promise<Db> | null = null;

export async function getDashboardData(): Promise<Db> {
  if (data) {
    return Promise.resolve(data);
  }
  if (request) {
    return request;
  }

  const headers = getHeaders()
  
  return (request = fetch({
    url: 'dashboard/data',
    headers
  })
  .then(async(res) =>  {
    data = (await res.json()) as Db;
    return Promise.resolve<Db>(data);
  }));
}
