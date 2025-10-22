import { GovUkRadioOption } from '../@types/user-defined'

export default class GovUkRadioGroup {
  static yesNoItems({
    includeNotApplicable = false,
    checkedValue,
  }: {
    includeNotApplicable?: boolean
    checkedValue?: boolean
  }): GovUkRadioOption[] {
    const options = [
      { text: 'Yes', value: 'yes' },
      { text: 'No', value: 'no' },
    ]

    if (includeNotApplicable) {
      options.push({ text: 'Not applicable', value: 'na' })
    }

    return options.map(option => ({
      ...option,
      checked: option.value === GovUkRadioGroup.determineCheckedValue(checkedValue),
    }))
  }

  private static determineCheckedValue(value?: boolean): 'yes' | 'no' | null {
    if (value === false) {
      return 'no'
    }

    if (value === true) {
      return 'yes'
    }

    return null
  }
}
