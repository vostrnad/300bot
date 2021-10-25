import brucharacters from '@app/modules/commands/common/brucharacters'
import { getCommandRunner } from '@test/utils/commands'
import { mockCensusApi } from '@test/utils/planetside'

describe('brucharacters', () => {
  const runCommand = getCommandRunner(brucharacters)

  it("should say that the list of bru's characters is empty", async () => {
    const reply = await runCommand('+brucharacters list')
    expect(reply).toEqual("The list of Bru's characters is empty.")
  })

  it('should add and remove characters from the database regardless of case', async () => {
    const requestData = mockCensusApi({
      character_name_list: [
        {
          characterId: 'testaddremove',
          name: { first: 'CustomChar', firstLower: 'customchar' },
        },
      ],
    })

    const reply = await runCommand('+brucharacters add CUStomChar')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      "**CustomChar** has been added to the list of Bru's characters.",
    )

    const requestData1 = mockCensusApi({
      character_name_list: [
        {
          characterId: 'testaddremove',
          name: { first: 'CustomChar', firstLower: 'customchar' },
        },
      ],
    })

    const reply1 = await runCommand('+brucharacters remove CUStomChar')
    expect(requestData1).toMatchSnapshot()
    expect(reply1).toEqual(
      "**CustomChar** has been removed from the list of Bru's characters.",
    )
  })

  it('should say that the character is already in the list', async () => {
    const requestData = mockCensusApi({
      character_name_list: [
        {
          characterId: 'testduplicate',
          name: { first: 'CustomChar', firstLower: 'customchar' },
        },
      ],
    })
    await runCommand('+brucharacters add CustomChar')
    const reply = await runCommand('+brucharacters add CustomChar')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      "**CustomChar** is already in the list of Bru's characters.",
    )
    await runCommand('+brucharacters remove CustomChar')
  })

  it('should not remove a character that is not in the list', async () => {
    const requestData = mockCensusApi({
      character_name_list: [
        {
          characterId: 'testunknown',
          name: { first: 'unknownChar', firstLower: 'unknownchar' },
        },
      ],
    })

    const reply = await runCommand('+brucharacters remove unknownChar')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      "**unknownChar** is not listed as one of Bru's characters.",
    )
  })

  it('should display the list of characters in the database', async () => {
    mockCensusApi({
      character_name_list: [
        {
          characterId: 'testlist',
          name: { first: 'CustomChar', firstLower: 'customchar' },
        },
      ],
    })

    await runCommand('+brucharacters add CUStomChar')

    const requestData1 = mockCensusApi({
      character_name_list: [
        {
          characterId: 'testlist',
          name: { first: 'CustomChar', firstLower: 'customchar' },
        },
      ],
    })

    const reply1 = await runCommand('+brucharacters list')
    expect(requestData1).toMatchSnapshot()
    expect(reply1).toEqual(
      'Here is the list of all known Bru characters: **CustomChar**.',
    )
  })
})
