import { PlayerNotFoundError } from '@app/errors'
import { constants } from '@app/global/constants'
import { SeparationTree } from '@app/utils/separation-tree'
import { getShortAgo } from '@app/utils/time'
import { Command } from '@commands/command-handler'
import { validateArgumentNumber } from '@commands/validators'
import { bruCharactersDatabase } from '@database/brucharacters'
import { censusApi } from '@planetside/census-api'
import { streamingApi } from '@planetside/streaming-api'
import { validatePlayerName } from '@planetside/validators'

const events: Record<string, [string, string]> = {
  '1': ['killed', 'was killed by'],
  '2': ['assisted in killing', 'was killed and {2} assisted'],
  '4': ['healed', 'was healed by'],
  '6': ["repaired {2}'s MAX", 'had their MAX repaired by'],
  '7': ['revived', 'was revived by'],
  '30': [
    'got a transport assist for',
    'was killed and {2} got a transport assist',
  ],
  '34': ['resupplied', 'was resupplied by'],
  '36': ['got a spot assist for', 'was killed and {2} got a spot assist'],
  '51': ['healed', 'was healed by'],
  '53': ['revived', 'was revived by'],
  '54': ['got a spot assist for', 'was killed and {2} got a spot assist'],
  '55': ['resupplied', 'was resupplied by'],
  '142': ["repaired {2}'s MAX", 'had their MAX repaired by'],
  '146': [
    'sat in a Sunderer whose gunner killed',
    'was killed by a Sunderer with {2} in it',
  ],
  '148': [
    'sat in a Magrider whose gunner killed',
    'was killed by a Magrider with {2} in it',
  ],
  '149': [
    'sat in a Vanguard whose gunner killed',
    'was killed by a Vanguard with {2} in it',
  ],
  '150': [
    'sat in a Prowler whose gunner killed',
    'was killed by a Prowler with {2} in it',
  ],
  '154': [
    'sat in a Liberator whose gunner killed',
    'was killed by a Liberator with {2} in it',
  ],
  '155': [
    'sat in a Galaxy whose gunner killed',
    'was killed by a Galaxy with {2} in it',
  ],
  '293': [
    'got a motion detect assist for',
    'was killed and {2} got a motion detect assist',
  ],
  '294': [
    'got a motion detect assist for',
    'was killed and {2} got a motion detect assist',
  ],
  '314': [
    'sat in a Harasser whose gunner killed',
    'was killed by a Harasser with {2} in it',
  ],
  '353': ['used a Scout Radar to detect', "was detected by {2}'s Scout Radar"],
  '354': ['used a Scout Radar to detect', "was detected by {2}'s Scout Radar"],
  '371': ['assisted in killing', 'was killed and {2} assisted'],
  '372': ['assisted in killing', 'was killed and {2} assisted'],
  '438': ["repaired {2}'s shield", 'had their shield repaired by'],
  '439': ["repaired {2}'s shield", 'had their shield repaired by'],
  '440': [
    'got a chain explosive assist for',
    'was killed and {2} got a chain explosive assist',
  ],
  '515': [
    'sat in a Valkyrie whose gunner killed',
    'was killed by a Valkyrie with {2} in it',
  ],
  '550': [
    'got a Concussion Grenade assist for',
    "was killed after being hit by {2}'s Concussion Grenade",
  ],
  '551': [
    'got a Concussion Grenade assist for',
    "was killed after being hit by {2}'s Concussion Grenade",
  ],
  '552': [
    'got an EMP Grenade assist for',
    "was killed after being hit by {2}'s EMP Grenade",
  ],
  '553': [
    'got an EMP Grenade assist for',
    "was killed after being hit by {2}'s EMP Grenade",
  ],
  '554': [
    'got a Flashbang assist for',
    "was killed after being hit by {2}'s Flashbang",
  ],
  '555': [
    'got a Flashbang assist for',
    "was killed after being hit by {2}'s Flashbang",
  ],
  '681': [
    'sat in an ANT whose gunner killed',
    'was killed by an ANT with {2} in it',
  ],
  '1393': [
    "used a Hardlight Barrier to block {2}'s fire",
    "had their fire blocked by {2}'s Hardlight Barrier",
  ],
  '1466': [
    'sat in a Colossus whose gunner killed',
    'was killed by a Colossus with {2} in it',
  ],
  '1510': [
    'sat in a Bastion whose gunner killed',
    'was killed by a Bastion with {2} in it',
  ],
}

const separationTrees = new Map<string, SeparationTree>()

const createBruCharactersSeparationTrees = () => {
  bruCharactersDatabase.forEach((_, characterId) => {
    if (!separationTrees.has(characterId)) {
      separationTrees.set(characterId, new SeparationTree(characterId))
    }
  })
}

streamingApi.init()
streamingApi.on(
  'gainExperience',
  ({ worldId, characterId, otherId, experienceId }) => {
    if (Number(worldId) !== constants.planetside.worldIds.wainwright) return
    if (!(experienceId in events)) return
    if (characterId.length !== otherId.length) return
    if (characterId === otherId) return

    createBruCharactersSeparationTrees()

    separationTrees.forEach((separationTree) =>
      separationTree.add(characterId, otherId, experienceId),
    )
  },
)
streamingApi.on('playerLogout', ({ characterId }) => {
  separationTrees.get(characterId)?.clear()
})

export default new Command({
  keyword: 'brudistance',
  description: "find player's interaction chain with Bru",
  help: "Usage: `{prefix}brudistance <player name>` - finds player's interaction chain with Bru",
  callback: async ({ args, reply, env }) => {
    if (args.length === 0) {
      return reply(env.command.getHelp(env.handler))
    }
    validateArgumentNumber(args.length, 1)
    const characterName = args[0]
    validatePlayerName(characterName)

    const bruCharacterIds = bruCharactersDatabase.keys
    if (bruCharacterIds.length === 0) {
      return reply('Error: Bru does not have any characters.')
    }

    const [bruCharacters, character] = await Promise.all([
      censusApi.getCharacterNamesAndOnlineStatuses(bruCharacterIds),
      censusApi.getCharacterName({
        name: { firstLower: characterName.toLowerCase() },
      }),
    ])

    if (character === null) throw new PlayerNotFoundError()

    if (bruCharacterIds.includes(character.characterId)) {
      return reply(`**${character.name.first}** is Bru.`)
    }

    const onlineBruCharacters = bruCharacters.filter(
      (item) => item.onlineStatus !== '0',
    )

    if (onlineBruCharacters.length === 0) {
      return reply('Bru is currently offline.')
    }
    if (onlineBruCharacters.length > 1) {
      return reply('Error: Bru is currently online on multiple characters.')
    }

    const bru = onlineBruCharacters[0]

    const chain = separationTrees
      .get(bru.characterId)
      ?.getShortestChain(character.characterId)
    if (!chain || chain.length === 0) {
      return reply(
        `No interaction chain found between **${bru.name.first}** and **${character.name.first}**.`,
      )
    }

    const chainCharacters = await censusApi.getPlayerNames(
      chain.map((node) => node.key),
    )

    let message = `Interaction chain between **${bru.name.first}** and **${character.name.first}**:\n\n`
    let prevName = `**${bru.name.first}**`

    const now = new Date()

    for (const node of chain) {
      let interactionString = 'interacted with'
      if (node.interaction?.name && node.interaction.name in events) {
        interactionString = node.interaction.initiator
          ? events[node.interaction.name][1]
          : events[node.interaction.name][0]
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const thisName = `**${chainCharacters[node.key]?.name.first || '???'}**`

      if (interactionString.includes('{1}')) {
        interactionString = interactionString.replace('{1}', prevName)
      } else {
        interactionString = `${prevName} ${interactionString}`
      }

      if (interactionString.includes('{2}')) {
        interactionString = interactionString.replace('{2}', thisName)
      } else {
        interactionString = `${interactionString} ${thisName}`
      }

      message += `${getShortAgo(
        new Date(node.timestamp),
        now,
      )}, ${interactionString}.\n`
      prevName = thisName
    }

    return reply(message)
  },
})
