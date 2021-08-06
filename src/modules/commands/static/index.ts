import { StaticCommand } from './StaticCommand'

export const staticCommands: StaticCommand[] = [
  new StaticCommand({
    keyword: 'rickroll',
    description: 'get rickrolled',
    help: 'Usage: `{prefix}rickroll` - get rickrolled',
    response: 'Never gonna give you up, never gonna let you down.',
  }),
]
