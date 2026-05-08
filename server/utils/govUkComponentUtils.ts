import { GovUkSummaryListItem } from '../@types/user-defined'

export default class GovUKComponentUtils {
  static summaryListRowsWithAndWithoutActions(items: Array<GovUkSummaryListItem>) {
    return items.map(item => {
      if (item.actions?.items?.length > 0) {
        return item
      }
      const classes = [item.classes, 'govuk-summary-list__row--no-actions'].join(' ').trim()

      return { ...item, classes }
    })
  }
}
