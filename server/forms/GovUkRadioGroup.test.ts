import { YesNoOrNotApplicable, YesOrNo } from '../@types/user-defined'
import GovUkRadioGroup from './GovUkRadioGroup'

describe('GovUkRadioGroup', () => {
  describe('yesNoItems', () => {
    it('should return a list of yes/no options', () => {
      expect(GovUkRadioGroup.yesNoItems({})).toStrictEqual([
        { text: 'Yes', value: 'yes', checked: false },
        { text: 'No', value: 'no', checked: false },
      ])
    })

    it('should return a list of yes/no options if passed false', () => {
      expect(GovUkRadioGroup.yesNoItems({ includeNotApplicable: false })).toStrictEqual([
        { text: 'Yes', value: 'yes', checked: false },
        { text: 'No', value: 'no', checked: false },
      ])
    })

    it('should include not applicable if passed true', () => {
      expect(GovUkRadioGroup.yesNoItems({ includeNotApplicable: true })).toStrictEqual([
        { text: 'Yes', value: 'yes', checked: false },
        { text: 'No', value: 'no', checked: false },
        { text: 'Not applicable', value: 'na', checked: false },
      ])
    })

    describe('handling checked values', () => {
      it('should flag "yes" option as checked if checked value is true', () => {
        expect(GovUkRadioGroup.yesNoItems({ includeNotApplicable: true, checkedValue: true })).toStrictEqual([
          { text: 'Yes', value: 'yes', checked: true },
          { text: 'No', value: 'no', checked: false },
          { text: 'Not applicable', value: 'na', checked: false },
        ])
      })

      it('should flag "no" option as checked if checked value is false', () => {
        expect(GovUkRadioGroup.yesNoItems({ includeNotApplicable: true, checkedValue: false })).toStrictEqual([
          { text: 'Yes', value: 'yes', checked: false },
          { text: 'No', value: 'no', checked: true },
          { text: 'Not applicable', value: 'na', checked: false },
        ])
      })

      it('should not flag an option as checked if checked value is null', () => {
        expect(GovUkRadioGroup.yesNoItems({ includeNotApplicable: true, checkedValue: null })).toStrictEqual([
          { text: 'Yes', value: 'yes', checked: false },
          { text: 'No', value: 'no', checked: false },
          { text: 'Not applicable', value: 'na', checked: false },
        ])
      })
    })
  })

  describe('valueFromYesOrNoItem', () => {
    it.each([
      ['yes', true],
      ['no', false],
    ])('returns boolean value from selected', (selected: YesOrNo, value: boolean) => {
      const result = GovUkRadioGroup.valueFromYesOrNoItem(selected)
      expect(result).toEqual(value)
    })
  })

  describe('valueFromYesNoOrNotApplicableItem', () => {
    it.each([
      ['yes', true],
      ['no', false],
      ['na', undefined],
    ])('returns boolean value from selected', (selected: YesNoOrNotApplicable, value: boolean) => {
      const result = GovUkRadioGroup.valueFromYesNoOrNotApplicableItem(selected)
      expect(result).toEqual(value)
    })
  })
})
