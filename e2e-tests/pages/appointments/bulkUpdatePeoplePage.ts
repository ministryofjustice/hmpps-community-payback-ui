import { Page } from '@playwright/test'
import PersonOnProbation from '../../delius/personOnProbation'
import AppointmentFormPage from './appointmentFormPage'

export default class BulkUpdatePeoplePage extends AppointmentFormPage {
  constructor(private readonly page: Page) {
    super(page, 'Select all people with the same attendance outcome')
  }

  async selectPeople(peopleOnProbation: PersonOnProbation[]) {
    /* eslint-disable no-plusplus, no-await-in-loop */
    for (let i = 0; i < peopleOnProbation.length; i++) {
      const label = peopleOnProbation[i].getNameAndCrnDisplay()

      await this.page.getByLabel(label).check()
    }
    /* eslint-enable no-plusplus, no-await-in-loop */
  }
}
