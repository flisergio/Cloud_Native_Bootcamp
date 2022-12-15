import winston from 'winston'

const { createLogger, format, transports } = winston
const { combine, splat, timestamp, json } = format
const { Console } = transports

const logger = createLogger({
  level: 'http',
  format: combine(
    splat(),
    timestamp(),
    json()
  ),
  transports: [
    new Console()
  ]
})

export default logger
