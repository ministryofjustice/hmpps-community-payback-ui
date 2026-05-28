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
    try {
      await expect(row).toBeVisible()
      return row
    } catch {
      await expect(this.nextPageButtonLocator, 'Check if next page').toBeVisible()
      await this.nextPageButtonLocator.click()
      return this.getRowByContent(content)
    }
  }
}

class DataTableAssertions {
  constructor(private readonly component: DataTableComponent) {}

  async toHaveItems() {
    const resultCount = await this.component.resultCount()
    expect(resultCount).toBeGreaterThan(1)
  }

  async notToHaveRowWithContent(content: string): Promise<void> {
    const rowLocator = this.component.itemsLocator.filter({ hasText: content })
    if (await this.component.nextPageButtonLocator.isVisible()) {
      await expect(rowLocator).not.toBeVisible()
      await this.component.nextPageButtonLocator.click()
      return this.notToHaveRowWithContent(content)
    }

    return expect(rowLocator).not.toBeVisible()
  }

  async notToHaveTodaysRowWithContent(content: string): Promise<void> {
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const rows = await this.component.itemsLocator.all()

    for (const row of rows) {
      // eslint-disable-next-line no-await-in-loop
      const rowText = await row.innerText()

      if (rowText.includes(today) && rowText.includes(content)) {
        throw new Error(`Expected not to find row containing "${content}" for today's date "${today}"`)
      }

      if (this.rowContainsDateNotToday(rowText)) {
        return
      }
    }

    if (await this.component.nextPageButtonLocator.isVisible()) {
      await this.component.nextPageButtonLocator.click()
      await this.notToHaveTodaysRowWithContent(content)
    }
  }

  private rowContainsDateNotToday(rowText: string): boolean {
    const dateMatch = rowText.match(/\b\d{1,2} [A-Z][a-z]+ \d{4}\b/)

    if (!dateMatch) {
      return false
    }

    const rowDate = new Date(dateMatch[0])
    const today = new Date()

    return rowDate.toDateString() !== today.toDateString()
  }
}
