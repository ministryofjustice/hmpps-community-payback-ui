import { Page } from '@playwright/test'
import DataTableComponent from './dataTableComponent'

export default class PersonTableComponent extends DataTableComponent {
  constructor(page: Page) {
    super(page)
  }

  async clickPersonLink(crn: string) {
    await this.itemsLocator.filter({ hasText: crn }).getByRole('link').click()
  }
}
