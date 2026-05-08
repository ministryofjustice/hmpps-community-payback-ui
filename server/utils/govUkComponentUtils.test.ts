import { GovUkSummaryListItem } from '../@types/user-defined'
import GovUKComponentUtils from './govUkComponentUtils'

describe('GovUKComponentUtils', () => {
  describe('summaryListRowsWithAndWithoutActions', () => {
    it('should return items unchanged when all items have action items', () => {
      const items: Array<GovUkSummaryListItem> = [
        {
          key: { text: 'Name' },
          value: { text: 'John Doe' },
          actions: { items: [{ text: 'Edit', href: '/edit', visuallyHiddenText: 'name' }] },
        },
        {
          key: { text: 'Age' },
          value: { text: '30' },
          actions: { items: [{ text: 'Change', href: '/change', visuallyHiddenText: 'age' }] },
        },
      ]

      const result = GovUKComponentUtils.summaryListRowsWithAndWithoutActions(items)

      expect(result).toEqual(items)
    })

    it('should add no-actions class to items without action items when some items have action items', () => {
      const items: Array<GovUkSummaryListItem> = [
        {
          key: { text: 'Name' },
          value: { text: 'John Doe' },
          actions: { items: [{ text: 'Edit', href: '/edit', visuallyHiddenText: 'name' }] },
        },
        {
          key: { text: 'Age' },
          value: { text: '30' },
          actions: { items: [] },
        },
      ]

      const result = GovUKComponentUtils.summaryListRowsWithAndWithoutActions(items)

      expect(result[0].classes).toBeUndefined()
      expect(result[1].classes).toBe('govuk-summary-list__row--no-actions')
    })

    it('should add no-actions class when item has empty actions items array', () => {
      const items: Array<GovUkSummaryListItem> = [
        {
          key: { text: 'Status' },
          value: { text: 'Active' },
          actions: { items: [] },
        },
      ]

      const result = GovUKComponentUtils.summaryListRowsWithAndWithoutActions(items)

      expect(result[0].classes).toBe('govuk-summary-list__row--no-actions')
    })

    it('should add no-actions class when item has undefined actions', () => {
      const items: Array<GovUkSummaryListItem> = [
        {
          key: { text: 'Status' },
          value: { text: 'Active' },
          actions: undefined,
        },
      ]

      const result = GovUKComponentUtils.summaryListRowsWithAndWithoutActions(items)

      expect(result[0].classes).toBe('govuk-summary-list__row--no-actions')
    })

    it('should add no-actions class when item has no action items and no existing classes', () => {
      const items: Array<GovUkSummaryListItem> = [
        {
          key: { text: 'Status' },
          value: { text: 'Active' },
        },
        {
          key: { text: 'Status' },
          value: { text: 'Active' },
          classes: '',
        },
        {
          key: { text: 'Status' },
          value: { text: 'Active' },
          classes: undefined,
        },
        {
          key: { text: 'Status' },
          value: { text: 'Active' },
          classes: null,
        },
      ]

      const results = GovUKComponentUtils.summaryListRowsWithAndWithoutActions(items)

      results.forEach(result => {
        expect(result.classes).toBe('govuk-summary-list__row--no-actions')
      })
    })

    it('should append no-actions class when item has no action items and existing classes', () => {
      const items: Array<GovUkSummaryListItem> = [
        {
          key: { text: 'Status' },
          value: { text: 'Active' },
          classes: 'custom-class another-class',
        },
      ]

      const result = GovUKComponentUtils.summaryListRowsWithAndWithoutActions(items)

      expect(result[0].classes).toBe('custom-class another-class govuk-summary-list__row--no-actions')
    })
  })
})
