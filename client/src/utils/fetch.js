export default (url, method, body) => {
    const headers = { 'Content-Type': 'application/json' };
    return fetch(url, {
        method,
        headers,
        body: JSON.stringify(body)
    }).then(res => res.ok ? res.json() : Promise.reject(res))
        .catch(Promise.reject.bind(Promise));
}