import GovUkCheckboxes from './GovUkCheckboxes'

describe('GovUkCheckboxes', () => {
  describe('getOptions', () => {
    const items = [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' },
      { label: 'Option C', value: 'c' },
    ]
    it('returns all items unchecked when no values parameter is provided', () => {
      const result = GovUkCheckboxes.getOptions(items, 'label', 'value')

      expect(result).toEqual([
        { text: 'Option A', value: 'a', checked: false },
        { text: 'Option B', value: 'b', checked: false },
        { text: 'Option C', value: 'c', checked: false },
      ])
    })

    it('returns the matching item checked when 1 value is provided', () => {
      const result = GovUkCheckboxes.getOptions(items, 'label', 'value', ['b'])

      expect(result).toEqual([
        { text: 'Option A', value: 'a', checked: false },
        { text: 'Option B', value: 'b', checked: true },
        { text: 'Option C', value: 'c', checked: false },
      ])
    })

    it('returns all matching items checked when multiple values are provided', () => {
      const result = GovUkCheckboxes.getOptions(items, 'label', 'value', ['a', 'c'])

      expect(result).toEqual([
        { text: 'Option A', value: 'a', checked: true },
        { text: 'Option B', value: 'b', checked: false },
        { text: 'Option C', value: 'c', checked: true },
      ])
    })
  })
})
