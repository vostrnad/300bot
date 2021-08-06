export interface CommandMessage<T = unknown> {
  text: string
  author: MessageAuthor
  reply: ReplyToMessage
  raw: T
}

type ReplyToMessage = (text: string) => void

interface MessageAuthor {
  /** Unique user identifier. */
  id: string
  /** Favored representation of user's name. */
  displayName: string
  /** String that can be used to mention user. */
  mention: string
  /** Determines if user has admin/moderator permissions. */
  admin: boolean
}

export interface CommandCallbackData<T = unknown> {
  args: string[]
  reply: ReplyToMessage
  author: MessageAuthor
  env: {
    handler: CommandHandler<never>
    command: Command<never>
  }
  raw: T
}

export type CommandCallback<T = unknown> = (
  data: CommandCallbackData<T>,
) => Promise<void> | void

interface CommandOptions {
  /**
   * If defined, Limits the number of arguments and joins all excessive
   * text into the last argument.
   */
  lastArgNumber?: number
  /**
   * If true, the command must be prefixed. If false, the command will
   * also work without prefix.
   */
  requirePrefix: boolean
  /**
   * If true, the first argument has to be separated by a space. If false,
   * the first argument does not have to be separated by a space.
   */
  firstArgSpace: boolean
  /**
   * If true, the command will not show in help.
   */
  hidden: boolean
}

export interface CommandConfig<T = unknown> {
  readonly keyword: string
  readonly alias?: string[]
  /** Short description of the command in lowercase. */
  readonly description: string
  /** Usage info on the command. `{prefix}` is replaced with the prefix. */
  readonly help: string
  readonly callback: CommandCallback<T>
  readonly options?: Partial<CommandOptions>
}

export class Command<T = unknown> {
  private static DEFAULT_OPTIONS: CommandOptions = {
    lastArgNumber: undefined,
    requirePrefix: true,
    firstArgSpace: true,
    hidden: false,
  }

  public readonly keyword: string
  public readonly alias: string[]
  public readonly description: string
  public readonly callback: CommandCallback<T>
  public readonly options: CommandOptions

  private readonly _help: string

  constructor(config: CommandConfig<T>) {
    const { keyword, alias, description, help, callback, options } = config
    this.keyword = keyword
    this.alias = alias || []
    this.description = description
    this.callback = callback
    this.options = {
      ...Command.DEFAULT_OPTIONS,
      ...options,
    }
    this._help = help
  }

  public getHelp(handler: CommandHandler<T>): string {
    return this._help.replace(/{prefix}/g, handler.prefix)
  }
}

interface CommandHandlerConfig<T = unknown> {
  commands: Array<Command<T>>
  prefix: string
  /**
   * Allows brackets in arguments, which is what users
   * sometimes do when misunderstanding the command help.
   */
  allowArgumentBrackets?: boolean
}

export class CommandHandler<T = unknown> {
  public readonly prefix: string
  private readonly _commands: Array<Command<T>>
  private readonly _allowArgumentBrackets: boolean

  constructor(config: CommandHandlerConfig<T>) {
    this.prefix = config.prefix
    this._commands = config.commands
    this._allowArgumentBrackets = config.allowArgumentBrackets || false
  }

  public getPublicCommands(): Array<Command<T>> {
    return this._commands.filter((command) => !command.options.hidden)
  }

  public getCommandHelp(keyword: string): string | null {
    const command = this.getCommand(keyword)
    if (command !== null) {
      return command.getHelp(this)
    } else {
      return null
    }
  }

  /**
   * Processes a text message. Returns true if a command was detected
   * and acted upon, false otherwise.
   */
  public async process(message: CommandMessage<T>): Promise<boolean> {
    const prefix = this.prefix
    for (const command of this._commands) {
      const commandAliases: string[] = [command.keyword, ...command.alias]

      for (const alias of commandAliases) {
        /** Command string without prefix. */
        let commandString: string

        if (message.text.startsWith(`${prefix}${alias}`)) {
          commandString = message.text.slice(prefix.length)
        } else if (
          command.options.requirePrefix === false &&
          message.text.startsWith(alias)
        ) {
          commandString = message.text
        } else {
          continue
        }

        let argString: string

        if (commandString === alias) {
          argString = ''
        } else if (commandString.startsWith(`${alias} `)) {
          argString = commandString.slice(alias.length + 1)
        } else if (command.options.firstArgSpace === false) {
          argString = commandString.slice(alias.length)
        } else {
          continue
        }

        const rawArgs = argString.split(' ')
        let filteredArgs: string[] = []

        if (!command.options.lastArgNumber) {
          // filter arguments from spaces
          filteredArgs = rawArgs.filter((value: string) => {
            return value.length > 0
          })
        } else {
          // fill arguments with max args and then join the rest
          for (let i = 0; i < rawArgs.length; i++) {
            const arg: string = rawArgs[i]
            if (filteredArgs.length < command.options.lastArgNumber - 1) {
              if (arg.length > 0) {
                filteredArgs.push(arg)
              }
            } else {
              filteredArgs.push(rawArgs.slice(i).join(' ').trim())
              break
            }
          }
        }

        if (this._allowArgumentBrackets) {
          // remove < and > from arguments
          filteredArgs = filteredArgs.map((arg: string) => {
            if (arg.length > 2 && arg.startsWith('<') && arg.endsWith('>')) {
              return arg.slice(1, arg.length - 1)
            } else {
              return arg
            }
          })
        }

        try {
          await command.callback({
            args: filteredArgs,
            reply: message.reply,
            author: message.author,
            env: {
              handler: this,
              command,
            },
            raw: message.raw,
          })
        } catch (e) {
          message.reply('An error occurred while processing the command.')
          console.error('Command error:', e)
        }

        return true
      }
    }

    return false
  }

  private getCommand(keyword: string) {
    const found = this._commands.find((command) => {
      return command.keyword === keyword || command.alias.includes(keyword)
    })
    if (found !== undefined) {
      return found
    } else {
      return null
    }
  }
}
