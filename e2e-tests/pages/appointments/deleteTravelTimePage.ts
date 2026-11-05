/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import AppointmentFormPage, { AppointmentFormPageAssertions } from './appointmentFormPage'

export default class DeleteTravelTimePage extends AppointmentFormPage {
  override expect: DeleteTravelTimePageAssertions = new DeleteTravelTimePageAssertions(this)

  readonly travelTimeDetailsLocator: Locator

  readonly deleteButtonLocator: Locator

  readonly cancelLinkLocator: Locator

  constructor(page: Page) {
    super(page, 'Delete travel time')
    this.travelTimeDetailsLocator = page.locator('.govuk-summary-card').filter({ hasText: 'Travel time details' })
    this.deleteButtonLocator = page.getByRole('button', { name: 'Delete' })
    this.cancelLinkLocator = page.getByRole('link', { name: 'Cancel' })
  }

  async clickCancel() {
    await this.cancelLinkLocator.click()
  }

  override async continue() {
    await this.deleteButtonLocator.click()
  }
}

class DeleteTravelTimePageAssertions extends AppointmentFormPageAssertions {
  constructor(private readonly deleteTravelTimePage: DeleteTravelTimePage) {
    super(deleteTravelTimePage)
  }

  async toSeeTravelTime(formattedTime: string) {
    await expect(this.deleteTravelTimePage.travelTimeDetailsLocator).toContainText(formattedTime)
  }
}
