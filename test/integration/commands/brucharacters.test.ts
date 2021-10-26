import brucharacters from '@commands/common/brucharacters'
import { bruCharactersDatabase } from '@database/brucharacters'
import { getCommandRunner } from '@test/utils/commands'
import { mockCensusApi } from '@test/utils/planetside'

beforeEach(async () => {
  await bruCharactersDatabase.clear()
})

describe('brucharacters', () => {
  const runCommand = getCommandRunner(brucharacters)

  it('should say that the character is already in the list', async () => {
    const character = {
      character_id: 'testduplicate',
      name: { first: 'CustomCharDup' },
    }

    const requestDataAdd = mockCensusApi({ character_name_list: [character] })
    const replyAdd = await runCommand('+brucharacters add CustomCharDup')
    expect(requestDataAdd).toMatchSnapshot()
    expect(replyAdd).toEqual(
      "**CustomCharDup** has been added to the list of Bru's characters.",
    )

    const requestDataDup = mockCensusApi({ character_name_list: [character] })
    const replyDup = await runCommand('+brucharacters add CustomCharDup')
    expect(requestDataDup).toMatchSnapshot()
    expect(replyDup).toEqual(
      "**CustomCharDup** is already in the list of Bru's characters.",
    )
  })

  it('should add and remove characters from the database regardless of case', async () => {
    const character = {
      character_id: 'testaddremove',
      name: { first: 'CustomChar' },
    }

    const requestDataAdd = mockCensusApi({ character_name_list: [character] })
    const replyAdd = await runCommand('+brucharacters add CUStomChar')
    expect(requestDataAdd).toMatchSnapshot()
    expect(replyAdd).toEqual(
      "**CustomChar** has been added to the list of Bru's characters.",
    )

    const requestDataRemove = mockCensusApi({
      character_name_list: [character],
    })
    const replyRemove = await runCommand('+brucharacters remove CUStomChar')
    expect(requestDataRemove).toMatchSnapshot()
    expect(replyRemove).toEqual(
      "**CustomChar** has been removed from the list of Bru's characters.",
    )
  })

  it('should not remove a character that is not in the list', async () => {
    const character = {
      character_id: 'testunknown',
      name: { first: 'unknownChar' },
    }

    const requestData = mockCensusApi({ character_name_list: [character] })
    const reply = await runCommand('+brucharacters remove unknownChar')
    expect(requestData).toMatchSnapshot()
    expect(reply).toEqual(
      "**unknownChar** is not listed as one of Bru's characters.",
    )
  })

  it("should say that the list of bru's characters is empty", async () => {
    const reply = await runCommand('+brucharacters list')
    expect(reply).toEqual("The list of Bru's characters is empty.")
  })

  it('should display the list of characters in the database', async () => {
    const character = {
      character_id: 'testlist',
      name: { first: 'CustomCharList' },
    }

    const requestDataAdd = mockCensusApi({ character_name_list: [character] })
    const replyAdd = await runCommand('+brucharacters add customcharlist')
    expect(requestDataAdd).toMatchSnapshot()
    expect(replyAdd).toEqual(
      "**CustomCharList** has been added to the list of Bru's characters.",
    )

    const requestDataList = mockCensusApi({ character_name_list: [character] })
    const replyList = await runCommand('+brucharacters list')
    expect(requestDataList).toMatchSnapshot()
    expect(replyList).toEqual(
      'Here is the list of all known Bru characters: **CustomCharList**.',
    )
  })
})
