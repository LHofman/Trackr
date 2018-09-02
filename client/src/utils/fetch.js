export default (url, method, authorization, body) => {
    const headers = { 'Content-Type': 'application/json' };
    if (authorization) headers.Authorization = localStorage.getItem('auth_token');
    return fetch(url, {
        method,
        headers,
        body: JSON.stringify(body)
    }).then(res => res.ok ? res.json() : Promise.reject(res))
        .catch(Promise.reject.bind(Promise));
}