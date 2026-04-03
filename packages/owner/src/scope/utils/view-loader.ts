
//import {fetch} from '~/utils';
export async function viewLoader(path:string) {
  const response = await fetch('/fms_owner/static/res/'+ path+".xml", {method: 'GET'})
  if(response.ok) {
    const content = await response.text();
    return content
  }
  return Promise.reject(response.statusText)
}