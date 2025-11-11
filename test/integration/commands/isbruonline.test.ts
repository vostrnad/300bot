import isbruonline from '@commands/common/isbruonline'
import { bruCharactersDatabase } from '@database/brucharacters'
import { getCommandRunner } from '@test/utils/commands'
import { mockCensusApi } from '@test/utils/planetside'

describe('isbruonline', () => {
  beforeEach(async () => {
    await bruCharactersDatabase.clear()
    await bruCharactersDatabase.set('miroitovs', 1)
    await bruCharactersDatabase.set('number5johnny', 1)
  })

  const runCommand = getCommandRunner(isbruonline)

  it('should say Bru is online and list the character(s) he is online with', async () => {
    const requestData = mockCensusApi({
      character_list: [
        {
          name: { first: 'MiroitoVS', first_lower: 'miroitovs' },
          faction_id: '1',
          online_status: '10',
          outfit_member: {
            outfit_id: '37512545478660293',
            outfit: {
              leader_character_id: '5428011263355078529',
              leader: { faction_id: '1' },
            },
          },
        },
        {
          name: { first: 'Number5Johnny', first_lower: 'number5johnny' },
          faction_id: '4',
          online_status: '10',
          outfit_member: {
            outfit_id: '37588148218236901',
            outfit: {
              leader_character_id: '5429269171559319377',
              leader: { faction_id: '3' },
            },
          },
        },
      ],
    })
    const reply = await runCommand('+isbruonline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      'Yes, Bru is online as **MiroitoVS** {emoji:faction_logo_vs|VS} and **Number5Johnny** {emoji:faction_logo_ns|NS} {emoji:faction_logo_tr|TR}!',
    )
  })

  it('should say Bru is offline', async () => {
    const requestData = mockCensusApi({
      character_list: [
        {
          name: { first: 'MiroitoVS', first_lower: 'miroitovs' },
          faction_id: '1',
          online_status: '0',
          outfit_member: {
            outfit_id: '37512545478660293',
            outfit: {
              leader_character_id: '5428011263355078529',
              leader: { faction_id: '1' },
            },
          },
        },
        {
          name: { first: 'Number5Johnny', first_lower: 'number5johnny' },
          faction_id: '4',
          online_status: '0',
          outfit_member: {
            outfit_id: '37588148218236901',
            outfit: {
              leader_character_id: '5429269171559319377',
              leader: { faction_id: '3' },
            },
          },
        },
      ],
    })
    const reply = await runCommand('+isbruonline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual('No, Bru is offline.')
  })

  it('should reverse the reply when isbruoffline alias is used', async () => {
    const requestData = mockCensusApi({
      character_list: [
        {
          name: { first: 'MiroitoVS', first_lower: 'miroitovs' },
          faction_id: '1',
          online_status: '10',
          outfit_member: {
            outfit_id: '37512545478660293',
            outfit: {
              leader_character_id: '5428011263355078529',
              leader: { faction_id: '1' },
            },
          },
        },
        {
          name: { first: 'Number5Johnny', first_lower: 'number5johnny' },
          faction_id: '4',
          online_status: '10',
          outfit_member: {
            outfit_id: '37588148218236901',
            outfit: {
              leader_character_id: '5429269171559319377',
              leader: { faction_id: '3' },
            },
          },
        },
      ],
    })
    const reply = await runCommand('+isbruoffline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      'No, Bru is online as **MiroitoVS** {emoji:faction_logo_vs|VS} and **Number5Johnny** {emoji:faction_logo_ns|NS} {emoji:faction_logo_tr|TR}.',
    )
  })
})
