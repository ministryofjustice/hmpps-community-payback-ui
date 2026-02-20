/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { expect, Page } from '@playwright/test'
import BasePage from '../basePage'

export default class CourseCompletionDetailsPage extends BasePage {
  readonly expect: CourseCompletionDetailsPageAssertions

  constructor(
    private readonly page: Page,
    expectedTitle: string,
  ) {
    super(page)
    this.expect = new CourseCompletionDetailsPageAssertions(this, expectedTitle)
  }
}

class CourseCompletionDetailsPageAssertions {
  constructor(
    private readonly page: CourseCompletionDetailsPage,
    private readonly expectedTitle: string,
  ) {}

  async toBeOnThePage() {
    await expect(this.page.headingLocator).toContainText(this.expectedTitle)
  }
}
