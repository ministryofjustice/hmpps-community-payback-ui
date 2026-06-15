import { GovUkRadioOrCheckboxOption } from '../@types/user-defined'

export default class GovUkCheckboxes {
  static getOptions = <T>(
    items: Array<T>,
    textKey: keyof T,
    valueKey: keyof T,
    values?: Array<string>,
  ): Array<GovUkRadioOrCheckboxOption> => {
    return items.map(item => {
      const value = item[valueKey].toString()
      return { text: item[textKey].toString(), value, checked: values?.includes(value) ?? false }
    })
  }
}
