class Jwt {
  constructor() {

  }

  sign(payload, secret, options) {
    return this.jwt.sign(payload, secret, options);
  }

  verify(token, secret, options) {
    return this.jwt.verify(token, secret, options);
  }
}
