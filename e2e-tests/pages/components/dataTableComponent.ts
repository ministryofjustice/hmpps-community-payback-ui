/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'

export default class DataTableComponent {
  readonly expect: DataTableAssertions

  readonly itemsLocator: Locator

  constructor(page: Page) {
    this.expect = new DataTableAssertions(this)
    this.itemsLocator = page.getByRole('table').getByRole('row')
  }

  resultCount(): Promise<number> {
    return this.itemsLocator.count()
  }
}

class DataTableAssertions {
  constructor(private readonly component: DataTableComponent) {}

  async toHaveItems() {
    const resultCount = await this.component.resultCount()
    expect(resultCount).toBeGreaterThan(1)
  }
}
