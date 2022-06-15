export function errorToUndefined(err: any) {
  if (err instanceof TypeError) {
    throw err
  }

  return undefined
}
