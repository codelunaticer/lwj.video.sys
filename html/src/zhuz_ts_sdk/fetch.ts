/**
 * get
 * @param url
 * @returns
 */
export function fetchGet(url: string) {
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  })
    .then((res) => res.json())
    .then((data) => data);
}
