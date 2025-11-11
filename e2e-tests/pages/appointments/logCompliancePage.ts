import { Locator, Page } from '@playwright/test'
import AppointmentFormPage from './appointmentFormPage'

export default class LogCompliancePage extends AppointmentFormPage {
  hiVisFieldLocator: Locator

  workedIntensivelyFieldLocator: Locator

  workedQualityFieldLocator: Locator

  behaviourFieldLocator: Locator

  notesFieldLocator: Locator

  constructor(page: Page) {
    super(page, 'Log compliance')
    this.hiVisFieldLocator = page.getByRole('group', { name: 'Did they wear hi-vis?' })
    this.workedIntensivelyFieldLocator = page.getByRole('group', { name: 'Did they work intensively?' })
    this.workedQualityFieldLocator = page.getByRole('group', { name: 'How was their work quality?' })
    this.behaviourFieldLocator = page.getByRole('group', { name: 'How was their behaviour?' })
    this.notesFieldLocator = page.getByLabel('Notes')
  }

  async enterComplianceDetails() {
    await this.hiVisFieldLocator.getByRole('radio', { name: 'Yes' }).check()
    await this.workedIntensivelyFieldLocator.getByRole('radio', { name: 'Yes' }).check()
    await this.workedQualityFieldLocator.getByRole('radio', { name: 'Good' }).check()
    await this.behaviourFieldLocator.getByRole('radio', { name: 'Poor' }).check()
    await this.notesFieldLocator.fill('They did a good job')
  }
}
