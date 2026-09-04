import { Page } from '@playwright/test'
import DataTableComponent from './dataTableComponent'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'

export default class AppointmentTableComponent extends DataTableComponent {
  constructor(page: Page) {
    super(page)
  }

  async clickAppointmentLinkWithCrn(crn: string) {
    await this.itemsLocator.filter({ hasText: crn }).getByRole('link', { name: 'View' }).click()
  }

  async clickAppointmentLinkWithDate(date: Date) {
    await this.itemsLocator
      .filter({ hasText: DateTimeFormats.dateObjtoUIDate(date) })
      .getByRole('link', { name: 'View' })
      .click()
  }
}
