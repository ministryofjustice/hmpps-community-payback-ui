import { SessionDto } from '../../../server/@types/shared'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import Page from '../page'

export default class BulkUpdatePage extends Page {
  constructor(session: SessionDto) {
    super(`${session.projectName} (${DateTimeFormats.isoDateToUIDate(session.date)})`)
  }

  protected override customCheckOnPage(): void {
    cy.get('legend').should('contain.text', 'Select all people with the same attendance outcome')
  }
}
