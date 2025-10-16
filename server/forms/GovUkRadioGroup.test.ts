import GovUkRadioGroup from './GovUkRadioGroup'

describe('GovUkRadioGroup', () => {
  describe('yesNoItems', () => {
    it('should return a list of yes/no options', () => {
      expect(GovUkRadioGroup.yesNoItems()).toStrictEqual([
        { text: 'Yes', value: 'yes' },
        { text: 'No', value: 'no' },
      ])
    })

    it('should return a list of yes/no options if passed false', () => {
      expect(GovUkRadioGroup.yesNoItems(false)).toStrictEqual([
        { text: 'Yes', value: 'yes' },
        { text: 'No', value: 'no' },
      ])
    })

    it('should include not applicable if passed true', () => {
      expect(GovUkRadioGroup.yesNoItems(true)).toStrictEqual([
        { text: 'Yes', value: 'yes' },
        { text: 'No', value: 'no' },
        { text: 'Not applicable', value: 'na' },
      ])
    })
  })
})
