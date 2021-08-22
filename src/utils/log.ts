import winston from 'winston'
import { env } from '@app/env'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4,
}

type LogLevel = keyof typeof levels

const consoleLogFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(
    ({ level, message, timestamp }: Record<string, string>) => {
      return `${timestamp} ${level} ${message}`
    },
  ),
)

class Logger {
  private readonly _logger: winston.Logger

  constructor(level: string) {
    this._logger = winston.createLogger({
      level,
      levels,
      transports: [
        new winston.transports.Console({
          format: consoleLogFormat,
        }),
      ],
    })
    this.info(`Logger started with level ${level}`)
  }

  public error(message: string, error?: Error): void {
    if (error) {
      this.log('error', `${message}\n${error.stack ?? error.message}`)
    } else {
      this.log('error', message)
    }
  }

  public warn(message: string): void {
    this.log('warn', message)
  }

  public info(message: string): void {
    this.log('info', message)
  }

  public debug(message: string): void {
    this.log('debug', message)
  }

  public verbose(message: string): void {
    this.log('verbose', message)
  }

  private log(level: LogLevel, message: string): void {
    this._logger.log(level, message)
  }
}

export const log = new Logger(env.logLevel || 'verbose')
