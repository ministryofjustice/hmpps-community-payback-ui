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

  async completeTravelTimeForm(time: 30 | 60 | 120) {
    const labels = { 30: '30 minutes total', 60: '1 hour total', 120: '2 hours total' }
    await this.timeInput.getByLabel(labels[time]).check()
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
