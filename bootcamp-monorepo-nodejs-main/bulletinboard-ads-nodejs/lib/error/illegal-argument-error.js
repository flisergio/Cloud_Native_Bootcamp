export default class IllegalArgumentError extends Error {
  constructor (message = 'Illegal Argument') {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.code = 400
  }
}
