import { GovUKActionItem, GovUkSummaryListItem } from '../@types/user-defined'

export type SummaryListBuildOptions = {
  label: string
  content?: string
  actions?: {
    items: Array<GovUKActionItem>
  }
  contentIsHtml?: boolean
}
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

  static buildSummaryListItem({
    label,
    content,
    actions = { items: [] },
    contentIsHtml = false,
  }: SummaryListBuildOptions): GovUkSummaryListItem {
    const value = contentIsHtml
      ? {
          html: content,
        }
      : {
          text: content,
        }
    const item = {
      key: {
        text: label,
      },
      value,
    } as GovUkSummaryListItem

    if (actions?.items?.length) {
      item.actions = actions
    }

    return item
  }

  static buildSummaryListItems(
    items: Array<SummaryListBuildOptions>,
    removeEmptyRows: boolean = false,
  ): Array<GovUkSummaryListItem> {
    const itemsToMap = removeEmptyRows ? items.filter(item => item.content) : items
    return itemsToMap.map(this.buildSummaryListItem)
  }
}
