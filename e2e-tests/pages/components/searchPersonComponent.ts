import { Locator, Page } from '@playwright/test'

export default class SearchPersonComponent {
  searchInput: Locator

  submit: Locator

  constructor(page: Page) {
    this.searchInput = page.getByRole('searchbox')
    this.submit = page.getByRole('button', { name: 'Search', exact: true })
  }

  async enterSearchTerm(searchTerm: string) {
    await this.searchInput.fill(searchTerm)
  }

  async submitForm() {
    await this.submit.click()
  }
}
