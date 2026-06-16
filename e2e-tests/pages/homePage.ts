/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import BasePage from './basePage'

export default class HomePage extends BasePage {
  readonly expect: HomePageAssertions

  readonly trackCommunityPaybackProgressLink: Locator

  readonly courseCompletionsLink: Locator

  readonly trackIndividualPlacementsLink: Locator

  readonly adjustTravelTimeLink: Locator

  constructor(private readonly page: Page) {
    super(page)
    this.expect = new HomePageAssertions(this)
    this.trackCommunityPaybackProgressLink = page.getByRole('link', {
      name: 'Record attendance at a group session',
    })
    this.courseCompletionsLink = page.getByRole('link', {
      name: 'Process Community Campus hours',
    })
    this.trackIndividualPlacementsLink = page.getByRole('link', {
      name: 'Record attendance at a host partner',
    })
    this.adjustTravelTimeLink = page.getByRole('link', {
      name: 'Record travel time',
    })
  }

  async visit() {
    await this.page.goto('/')
  }
}

class HomePageAssertions {
  constructor(private readonly page: HomePage) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText('Record attendance on community payback')
  }
}
