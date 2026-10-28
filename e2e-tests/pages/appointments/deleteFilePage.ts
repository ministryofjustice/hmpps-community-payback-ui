/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import AppointmentFormPage, { AppointmentFormPageAssertions } from './appointmentFormPage'

export default class DeleteFilePage extends AppointmentFormPage {
  override expect: DeleteFilePageAssertions = new DeleteFilePageAssertions(this)

  readonly fileDetailsLocator: Locator

  readonly deleteButtonLocator: Locator

  readonly cancelLinkLocator: Locator

  constructor(page: Page) {
    super(page, 'Delete file')
    this.fileDetailsLocator = page.locator('.govuk-summary-card').filter({ hasText: 'File details' })
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

class DeleteFilePageAssertions extends AppointmentFormPageAssertions {
  constructor(private readonly deleteFilePage: DeleteFilePage) {
    super(deleteFilePage)
  }

  async toShowFile(filename: string) {
    await expect(this.deleteFilePage.fileDetailsLocator).toContainText(filename)
  }
}
