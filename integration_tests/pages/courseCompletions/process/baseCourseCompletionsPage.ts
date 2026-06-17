import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import Page from '../../page'

export default class BaseCourseCompletionsPage extends Page {
  constructor(title: string) {
    super(title)
  }

  clickUnableToCreditTimeLink() {
    cy.get('a').contains('Unable to credit hours').click()
  }

  static getName(courseCompletion: EteCourseCompletionEventDto) {
    return `${courseCompletion.firstName} ${courseCompletion.lastName}`
  }
}
