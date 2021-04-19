import { LooseObject, Maybe } from '../types/shared/general';

export default (
  url: string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  authorization: boolean = false,
  body?: LooseObject
): Promise<any> => {
  const headers: LooseObject = { 'Content-Type': 'application/json' };
  if (authorization) headers.Authorization = localStorage.getItem('auth_token');
  
  return fetch(url, {
    method,
    headers,
    body: JSON.stringify(body)
  }).then(res => {
    return res.ok ? res.json() : Promise.reject(res);
  }).catch(Promise.reject.bind(Promise));
}