/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Locator, Page } from '@playwright/test'
import BasePage from '../basePage'
import PersonOnProbation from '../../delius/personOnProbation'
import HoursMinutesInputComponent from '../components/hoursMinutesInputComponent'
import DateInputComponent from '../components/dateInputComponent'

export default class TravelTimePage extends BasePage {
  readonly expect: TravelTimePageAssertions

  private readonly hoursMinutesInput: HoursMinutesInputComponent

  private readonly dateInput: DateInputComponent

  private readonly creditTravelTimeButtonLocator: Locator

  private readonly notEligibleForTravelTimeButtonLocator: Locator

  constructor(page: Page, personOnProbation: PersonOnProbation) {
    super(page)
    this.expect = new TravelTimePageAssertions(this, personOnProbation.getFullName())
    this.hoursMinutesInput = new HoursMinutesInputComponent(page)
    this.dateInput = new DateInputComponent(page)
    this.creditTravelTimeButtonLocator = page.getByRole('button', { name: 'Credit travel time' })
    this.notEligibleForTravelTimeButtonLocator = page.getByRole('button', { name: 'Not eligible for travel time' })
  }

  async completeTravelTimeForm(timeCredited: { hours: string; minutes: string } = { hours: '1', minutes: '10' }) {
    const date = new Date()
    await this.dateInput.enterDate(date)
    await this.hoursMinutesInput.enterHours(timeCredited.hours, timeCredited.minutes)
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
