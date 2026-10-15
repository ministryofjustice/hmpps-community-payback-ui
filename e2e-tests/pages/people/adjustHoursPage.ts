/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import DatePickerComponent from '../components/datePickerComponent'
import BasePage from '../basePage'
import HoursMinutesInputComponent from '../components/hoursMinutesInputComponent'

export default class AdjustHoursPage extends BasePage {
  readonly expect: AdjustHoursPageAssertions

  datePickerComponent: DatePickerComponent

  hoursAndMinutesComponent: HoursMinutesInputComponent

  private readonly reasonInputLocator: Locator

  private readonly continueButtonLocator: Locator

  constructor(page: Page, expectedTitle: string) {
    super(page)
    this.expect = new AdjustHoursPageAssertions(this, expectedTitle)
    this.datePickerComponent = new DatePickerComponent(page)
    this.hoursAndMinutesComponent = new HoursMinutesInputComponent(page, true)

    this.reasonInputLocator = page.getByRole('group', { name: 'Select reason' })
    this.continueButtonLocator = page.getByRole('button', { name: 'Continue' })
  }

  async setReason(n: number) {
    await this.reasonInputLocator.getByRole('radio').nth(n).check()
  }

  async continue() {
    await this.continueButtonLocator.click()
  }
}

class AdjustHoursPageAssertions {
  constructor(
    private readonly page: AdjustHoursPage,
    private readonly expectedTitle: string,
  ) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle)
  }
}
