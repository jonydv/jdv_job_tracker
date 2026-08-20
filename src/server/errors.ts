export class KnownActionError extends Error {
  constructor(public key: string) {
    super(key)
  }
}
