/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from '../basePage'
import PersonOnProbation from '../../delius/personOnProbation'

export default class TravelTimePage extends BasePage {
  readonly expect: TravelTimePageAssertions

  private readonly timeInput: Locator

  private readonly creditTravelTimeButtonLocator: Locator

  private readonly notEligibleForTravelTimeButtonLocator: Locator

  constructor(page: Page, personOnProbation: PersonOnProbation) {
    super(page)
    this.expect = new TravelTimePageAssertions(this, personOnProbation.getFullName())
    this.creditTravelTimeButtonLocator = page.getByRole('button', { name: 'Credit travel time' })
    this.notEligibleForTravelTimeButtonLocator = page.getByRole('button', { name: 'Not eligible for travel time' })
    this.timeInput = page.getByRole('group', { name: 'Add travel time' })
  }

  async completeTravelTimeForm(time: 60 | 120) {
    let n = 0
    switch (time) {
      case 60:
        n = 0
        break
      default:
        n = 1
    }
    await this.timeInput.getByRole('radio').nth(n).check()
  }

  async submitCreditTravelTime() {
    await this.creditTravelTimeButtonLocator.click()
  }

  async submitNotEligibleForTravelTime() {
    await this.notEligibleForTravelTimeButtonLocator.click()
  }
}

class TravelTimePageAssertions {
  constructor(
    private readonly page: TravelTimePage,
    private readonly personName: string,
  ) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText(this.personName)
  }
}
