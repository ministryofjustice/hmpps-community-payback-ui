import MojDateInput from '../forms/mojDateInput'
import GroupSessionIndexPage, { GroupSessionIndexPageInput } from './groupSessionIndexPage'

describe('GroupSessionIndexPage', () => {
  describe('validationErrors', () => {
    it('returns errors when fields are empty', () => {
      const page = new GroupSessionIndexPage({} as GroupSessionIndexPageInput)
      jest.spyOn(MojDateInput, 'validate').mockReturnValue(undefined)

      expect(page.validationErrors()).toEqual({
        team: { text: 'Choose a team' },
        provider: { text: 'Choose a region' },
      })
    })

    it('returns date error', () => {
      const dateError = { text: 'Date error' }
      jest.spyOn(MojDateInput, 'validate').mockReturnValue(dateError)
      const page = new GroupSessionIndexPage({
        date: '11/13/2025',
        provider: 'x',
        team: 'y',
      } as GroupSessionIndexPageInput)

      expect(page.validationErrors()).toEqual({
        date: dateError,
      })
    })
  })

  describe('items', () => {
    it('returns date value for template', () => {
      const page = new GroupSessionIndexPage({
        date: '11/03/2025',
      } as GroupSessionIndexPageInput)

      expect(page.items()).toEqual({
        date: '11/03/2025',
      })
    })
  })

  describe('searchValues', () => {
    it('returns query items formatted for API request with same date for startDate and endDate', () => {
      const page = new GroupSessionIndexPage({
        team: 'XR123',
        date: '7/7/2024',
      })

      const result = page.searchValues()

      expect(result).toEqual({
        startDate: '2024-07-07',
        endDate: '2024-07-07',
        teamCode: 'XR123',
      })
    })
  })

  describe('objectContainsSearchProperty', () => {
    describe('object contains property', () => {
      it.each([
        [{ team: 'TEAM1' }],
        [{ provider: 'PROVIDER1' }],
        [{ date: '01/01/2024' }],
        [{ team: 'TEAM1', provider: 'PROVIDER1', date: '01/01/2024' }],
        [{ team: '' }],
        [{ date: '31/12/2024' }],
      ])('should return true given %s', queryObject => {
        const result = GroupSessionIndexPage.objectContainsSearchProperty(queryObject)
        expect(result).toBe(true)
      })
    })

    describe('object does not contain property', () => {
      it.each([
        [{}],
        [{ other: 'value' }],
        [{ notASearchProperty: 'value', anotherOne: 'test' }],
        [{ team: undefined }],
        [{ provider: undefined, date: undefined }],
      ])('should return false given %s', queryObject => {
        const result = GroupSessionIndexPage.objectContainsSearchProperty(queryObject)
        expect(result).toBe(false)
      })
    })
  })
})
