/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'

export default class DataTableComponent {
  readonly expect: DataTableAssertions

  readonly itemsLocator: Locator

  readonly nextPageButtonLocator: Locator

  constructor(page: Page) {
    this.expect = new DataTableAssertions(this)
    this.itemsLocator = page.getByRole('table').getByRole('row')
    this.nextPageButtonLocator = page.getByRole('link', { name: 'Next' })
  }

  resultCount(): Promise<number> {
    return this.itemsLocator.count()
  }

  async getRowByContent(content: string): Promise<Locator> {
    const row = this.itemsLocator.filter({ hasText: content })
    if (await row.isVisible()) {
      return row
    }

    if (await this.nextPageButtonLocator.isVisible()) {
      await this.nextPageButtonLocator.click()
      return this.getRowByContent(content)
    }
    throw new Error(`Row with content "${content}" not found`)
  }
}

class DataTableAssertions {
  constructor(private readonly component: DataTableComponent) {}

  async toHaveItems() {
    const resultCount = await this.component.resultCount()
    expect(resultCount).toBeGreaterThan(1)
  }
}
