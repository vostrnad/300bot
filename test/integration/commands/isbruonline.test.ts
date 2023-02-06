import isbruonline from '@commands/discord/isbruonline'
import { getCommandRunner } from '@test/utils/commands'
import { mockCensusApi } from '@test/utils/planetside'

describe('isbruonline', () => {
  const runCommand = getCommandRunner(isbruonline)

  it('should say Bru is online and list the character(s) he is online with', async () => {
    const requestData = mockCensusApi({
      character_list: [
        {
          character_id: 'testlist',
          name: { first: 'MiroitoVS', first_lower: 'miroitovs' },
          faction_id: '1',
          head_id: '5',
          title_id: '0',
          times: {
            creation: '1502020291',
            creation_date: '2017-08-06 11:51:31.0',
            last_save: '1659281631',
            last_save_date: '2022-07-31 15:33:51.0',
            last_login: '1659269547',
            last_login_date: '2022-07-31 12:12:27.0',
            login_count: '305',
            minutes_played: '20631',
          },
          certs: {
            earned_points: '63245',
            gifted_points: '8742',
            spent_points: '62563',
            available_points: '9424',
            percent_to_next: '0.888',
          },
          battle_rank: { percent_to_next: '35', value: '88' },
          profile_id: '20',
          daily_ribbon: {
            count: '0',
            time: '1659225600',
            date: '2022-07-31 00:00:00.0',
          },
          prestige_level: '0',
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
          character_id: 'testlist',
          name: { first: 'Number5Johnny', first_lower: 'number5johnny' },
          faction_id: '4',
          head_id: '5',
          title_id: '0',
          times: {
            creation: '1641022496',
            creation_date: '2022-01-01 07:34:56.0',
            last_save: '1675632997',
            last_save_date: '2023-02-05 21:36:37.0',
            last_login: '1675612529',
            last_login_date: '2023-02-05 15:55:29.0',
            login_count: '229',
            minutes_played: '36020',
          },
          certs: {
            earned_points: '311191',
            gifted_points: '11132',
            spent_points: '300806',
            available_points: '21517',
            percent_to_next: '0.1351111111109',
          },
          battle_rank: { percent_to_next: '54', value: '61' },
          profile_id: '190',
          daily_ribbon: {
            count: '0',
            time: '1675555200',
            date: '2023-02-05 00:00:00.0',
          },
          prestige_level: '3',
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
      returned: 2,
    })
    const reply = await runCommand('+isbruonline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      'Yes, Bru is online as **MiroitoVS** VS and **Number5Johnny** NS TR!',
    )
  })

  it('should say Bru is offline', async () => {
    const requestData = mockCensusApi({
      character_list: [
        {
          character_id: '5428631729584582401',
          name: { first: 'MiroitoVS', first_lower: 'miroitovs' },
          faction_id: '1',
          head_id: '5',
          title_id: '0',
          times: {
            creation: '1502020291',
            creation_date: '2017-08-06 11:51:31.0',
            last_save: '1659281631',
            last_save_date: '2022-07-31 15:33:51.0',
            last_login: '1659269547',
            last_login_date: '2022-07-31 12:12:27.0',
            login_count: '305',
            minutes_played: '20631',
          },
          certs: {
            earned_points: '63245',
            gifted_points: '8742',
            spent_points: '62563',
            available_points: '9424',
            percent_to_next: '0.888',
          },
          battle_rank: { percent_to_next: '35', value: '88' },
          profile_id: '20',
          daily_ribbon: {
            count: '0',
            time: '1659225600',
            date: '2022-07-31 00:00:00.0',
          },
          prestige_level: '0',
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
          character_id: '5429210842260871009',
          name: { first: 'Number5Johnny', first_lower: 'number5johnny' },
          faction_id: '4',
          head_id: '5',
          title_id: '0',
          times: {
            creation: '1641022496',
            creation_date: '2022-01-01 07:34:56.0',
            last_save: '1675632997',
            last_save_date: '2023-02-05 21:36:37.0',
            last_login: '1675612529',
            last_login_date: '2023-02-05 15:55:29.0',
            login_count: '229',
            minutes_played: '36020',
          },
          certs: {
            earned_points: '311191',
            gifted_points: '11132',
            spent_points: '300806',
            available_points: '21517',
            percent_to_next: '0.1351111111109',
          },
          battle_rank: { percent_to_next: '54', value: '61' },
          profile_id: '190',
          daily_ribbon: {
            count: '0',
            time: '1675555200',
            date: '2023-02-05 00:00:00.0',
          },
          prestige_level: '3',
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
      returned: 2,
    })
    const reply = await runCommand('+isbruonline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual('No, Bru is offline.')
  })

  it('should reverse the reply when isbruoffline alias is used', async () => {
    const requestData = mockCensusApi({
      character_list: [
        {
          character_id: '5428631729584582401',
          name: { first: 'MiroitoVS', first_lower: 'miroitovs' },
          faction_id: '1',
          head_id: '5',
          title_id: '0',
          times: {
            creation: '1502020291',
            creation_date: '2017-08-06 11:51:31.0',
            last_save: '1659281631',
            last_save_date: '2022-07-31 15:33:51.0',
            last_login: '1659269547',
            last_login_date: '2022-07-31 12:12:27.0',
            login_count: '305',
            minutes_played: '20631',
          },
          certs: {
            earned_points: '63245',
            gifted_points: '8742',
            spent_points: '62563',
            available_points: '9424',
            percent_to_next: '0.888',
          },
          battle_rank: { percent_to_next: '35', value: '88' },
          profile_id: '20',
          daily_ribbon: {
            count: '0',
            time: '1659225600',
            date: '2022-07-31 00:00:00.0',
          },
          prestige_level: '0',
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
          character_id: '5429210842260871009',
          name: { first: 'Number5Johnny', first_lower: 'number5johnny' },
          faction_id: '4',
          head_id: '5',
          title_id: '0',
          times: {
            creation: '1641022496',
            creation_date: '2022-01-01 07:34:56.0',
            last_save: '1675632997',
            last_save_date: '2023-02-05 21:36:37.0',
            last_login: '1675612529',
            last_login_date: '2023-02-05 15:55:29.0',
            login_count: '229',
            minutes_played: '36020',
          },
          certs: {
            earned_points: '311191',
            gifted_points: '11132',
            spent_points: '300806',
            available_points: '21517',
            percent_to_next: '0.1351111111109',
          },
          battle_rank: { percent_to_next: '54', value: '61' },
          profile_id: '190',
          daily_ribbon: {
            count: '0',
            time: '1675555200',
            date: '2023-02-05 00:00:00.0',
          },
          prestige_level: '3',
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
      returned: 2,
    })
    const reply = await runCommand('+isbruoffline')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      'No, Bru is online as **MiroitoVS** VS and **Number5Johnny** NS TR.',
    )
  })
})
