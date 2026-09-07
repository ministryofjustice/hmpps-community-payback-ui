/* eslint max-classes-per-file: "off" -- splitting out these classes would cause an import dependency loop */

import { Locator, Page, expect } from '@playwright/test'
import AppointmentFormPage, { AppointmentFormPageAssertions } from './appointmentFormPage'
import SummaryListComponent from '../components/summaryListComponent'

export default class CheckAppointmentDetailsPage extends AppointmentFormPage {
  override expect: CheckAppointmentDetailsPageAssertions = new CheckAppointmentDetailsPageAssertions(this)

  readonly supervisorInputLocator: Locator

  readonly updateButtonLocator: Locator

  readonly travelTimeButtonLocator: Locator

  readonly details: SummaryListComponent

  constructor(page: Page) {
    super(page, 'Appointment details')
    this.supervisorInputLocator = page.getByLabel('Choose supervisor')
    this.updateButtonLocator = page.getByRole('button', { name: 'Update appointment' })
    this.travelTimeButtonLocator = page.getByRole('button', { name: 'Process travel time' })
    this.details = new SummaryListComponent(page)
  }

  chooseSupervisor(supervisor: string) {
    this.supervisorInputLocator.selectOption({ label: supervisor })
  }

  async clickProcessTravelTime() {
    await this.travelTimeButtonLocator.click()
  }

  override async continue() {
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
}
