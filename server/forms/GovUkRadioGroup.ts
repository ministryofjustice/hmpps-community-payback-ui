import { GovUkOption } from '../@types/user-defined'

export default class GovUkRadioGroup {
  static yesNoItems(includeNotApplicable: boolean = false): GovUkOption[] {
    const options = [
      { text: 'Yes', value: 'yes' },
      { text: 'No', value: 'no' },
    ]

    if (includeNotApplicable) {
      options.push({ text: 'Not applicable', value: 'na' })
    }

    return options
  }
}
