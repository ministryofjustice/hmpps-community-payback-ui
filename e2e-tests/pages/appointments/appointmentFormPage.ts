/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import BasePage from '../basePage'

export default abstract class AppointmentFormPage extends BasePage {
  readonly expect: AppointmentFormPageAssertions

  readonly formHeadingLocator: Locator

  readonly continueButtonLocator: Locator

  questionLocator: Locator

  constructor(page: Page, expectedFormHeading: string) {
    super(page)
    this.expect = new AppointmentFormPageAssertions(this)
    this.continueButtonLocator = page.getByRole('button', { name: 'Continue' })
    this.questionLocator = page.getByText(expectedFormHeading)
  }

  async continue() {
    await this.continueButtonLocator.click()
  }
}

class AppointmentFormPageAssertions {
  constructor(private readonly page: AppointmentFormPage) {}

  async toBeOnThePage() {
    await expect(this.page.questionLocator).toBeVisible()
  }
}
