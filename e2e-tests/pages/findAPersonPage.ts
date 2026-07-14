/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Page } from '@playwright/test'
import BasePage from './basePage'
import PersonTableComponent from './components/personTableComponent'
import SearchPersonComponent from './components/searchPersonComponent'

export default class FindAPersonPage extends BasePage {
  readonly expect: FindAPersonPageAssertions

  readonly people: PersonTableComponent

  readonly search: SearchPersonComponent

  constructor(page: Page) {
    super(page)
    this.expect = new FindAPersonPageAssertions(this, 'Find a person on probation')
    this.people = new PersonTableComponent(page)
    this.search = new SearchPersonComponent(page)
  }
}

class FindAPersonPageAssertions {
  constructor(
    private readonly page: FindAPersonPage,
    private readonly expectedTitle: string,
  ) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle)
  }
}
