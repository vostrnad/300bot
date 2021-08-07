import { sentence } from './language'

describe('language', () => {
  describe('sentence', () => {
    it('should create a sentence with the default join word', () => {
      expect(sentence(['me', 'you'])).toEqual('me and you')
      expect(sentence(['me', 'you', 'all of us'])).toEqual(
        'me, you and all of us',
      )
    })

    it('should not use the join word with fewer than two words', () => {
      expect(sentence([])).toEqual('')
      expect(sentence(['me'])).toEqual('me')
    })
  })
})
