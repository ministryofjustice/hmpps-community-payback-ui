/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from '../basePage'

export default class AdjustHoursConfirmPage extends BasePage {
  readonly expect: AdjustHoursConfirmPageAssertions

  private readonly submitButtonLocator: Locator

  constructor(page: Page, expectedTitle: string) {
    super(page)
    this.expect = new AdjustHoursConfirmPageAssertions(this, expectedTitle)
    this.submitButtonLocator = page.getByRole('button', { name: 'Submit' })
  }

  async submit() {
    await this.submitButtonLocator.click()
  }
}

class AdjustHoursConfirmPageAssertions {
  constructor(
    private readonly page: AdjustHoursConfirmPage,
    private readonly expectedTitle: string,
  ) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle)
  }
}
