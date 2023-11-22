export let api_origin = 'http://localhost:3000'

export function callWithQuery(method: string, url: string, input: object) {
  return fetch(
    api_origin + url + '?' + new URLSearchParams(Object.entries(input)),
    {
      method,
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    },
  )
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
}

export function callWithBody(method: string, url: string, input: object) {
  return fetch(api_origin + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    body: JSON.stringify(input),
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
}

export function callWithFormData(method: string, url: string, input: BodyInit) {
  return fetch(api_origin + url, {
    method,
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
    body: input,
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
}
