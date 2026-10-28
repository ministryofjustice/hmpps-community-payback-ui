import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class UploadFilePage extends AppointmentFormPage {
  readonly fileInputLocator: Locator

  readonly submitButtonLocator: Locator

  constructor(page: Page) {
    super(page, 'Upload file')
    this.fileInputLocator = page.locator('input[type="file"]')
    this.submitButtonLocator = page.getByRole('button', { name: 'Submit' })
  }

  async chooseFile(name: string, contents: string) {
    await this.fileInputLocator.setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(contents) })
  }

  override async continue() {
    await this.submitButtonLocator.click()
  }
}
