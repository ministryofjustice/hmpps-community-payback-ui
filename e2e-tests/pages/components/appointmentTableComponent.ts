import { Page } from '@playwright/test'
import DataTableComponent from './dataTableComponent'

export default class AppointmentTableComponent extends DataTableComponent {
  constructor(page: Page) {
    super(page)
  }

  async clickAppointmentLinkWithCrn(crn: string) {
    await this.itemsLocator.filter({ hasText: crn }).getByRole('link', { name: 'View' }).click()
  }
}
