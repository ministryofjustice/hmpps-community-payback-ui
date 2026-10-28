/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import AppointmentFormPage, { AppointmentFormPageAssertions } from './appointmentFormPage'
import SummaryListComponent from '../components/summaryListComponent'

export default class CheckAppointmentDetailsPage extends AppointmentFormPage {
  override expect: CheckAppointmentDetailsPageAssertions = new CheckAppointmentDetailsPageAssertions(this)

  readonly supervisorInputLocator: Locator

  readonly actionsButtonLocator: Locator

  readonly updateButtonLocator: Locator

  readonly travelTimeButtonLocator: Locator

  readonly uploadFileButtonLocator: Locator

  readonly filesLocator: Locator

  readonly missingEvidenceWarningLocator: Locator

  readonly successBannerLocator: Locator

  readonly details: SummaryListComponent

  constructor(page: Page) {
    super(page, 'Appointment details')
    this.supervisorInputLocator = page.getByLabel('Choose supervisor')
    this.updateButtonLocator = page.getByRole('button', { name: 'Update appointment' })
    this.travelTimeButtonLocator = page.getByRole('button', { name: 'Process travel time' })
    this.uploadFileButtonLocator = page.getByRole('button', { name: 'Upload file' })
    this.actionsButtonLocator = page.getByRole('button', { name: 'Actions' })
    this.filesLocator = page
      .locator('.govuk-summary-card')
      .filter({ has: page.getByRole('heading', { name: 'Files' }) })
    this.missingEvidenceWarningLocator = page.getByText('Evidence not yet provided.')
    this.successBannerLocator = page.locator('.govuk-notification-banner')
    this.details = new SummaryListComponent(page)
  }

  chooseSupervisor(supervisor: string) {
    this.supervisorInputLocator.selectOption({ label: supervisor })
  }

  async clickProcessTravelTime() {
    await this.actionsButtonLocator.click()
    await this.travelTimeButtonLocator.click()
  }

  async clickUploadFile() {
    await this.actionsButtonLocator.click()
    await this.uploadFileButtonLocator.click()
  }

  async clickDeleteFile(filename: string) {
    await this.filesLocator.getByRole('link', { name: `Delete ${filename}` }).click()
  }

  async downloadFile(filename: string) {
    const downloadPromise = this.page.waitForEvent('download')
    await this.filesLocator.getByRole('link', { name: `Download ${filename}` }).click()
    return downloadPromise
  }

  override async continue() {
    await this.actionsButtonLocator.click()
    await this.updateButtonLocator.click()
  }
}

class CheckAppointmentDetailsPageAssertions extends AppointmentFormPageAssertions {
  appointmentDetailsPage: CheckAppointmentDetailsPage

  constructor(page: CheckAppointmentDetailsPage) {
    super(page)
    this.appointmentDetailsPage = page
  }

  async toSeeTravelTime(formattedTime: string) {
    await this.appointmentDetailsPage.details.expect.toHaveItemWith('Total travel time', formattedTime)
    await expect(this.appointmentDetailsPage.travelTimeButtonLocator).not.toBeVisible()
  }

  async toShowSuccessMessage(message: string) {
    await expect(this.appointmentDetailsPage.successBannerLocator).toContainText(message)
  }

  async toShowFile(filename: string) {
    await expect(this.appointmentDetailsPage.filesLocator).toContainText(filename)
  }

  async toShowNoFiles() {
    await expect(this.appointmentDetailsPage.filesLocator).not.toBeVisible()
  }

  async toShowMissingEvidenceWarning() {
    await expect(this.appointmentDetailsPage.missingEvidenceWarningLocator).toBeVisible()
  }

  async notToShowMissingEvidenceWarning() {
    await expect(this.appointmentDetailsPage.missingEvidenceWarningLocator).not.toBeVisible()
  }
}
