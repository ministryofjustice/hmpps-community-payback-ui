import { EteCourseCompletionEventDto, OffenderFullDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import LearnerDetailsComponent from '../learnerDetailsComponent'
import OffenderDetailsComponent from '../offenderDetailsComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class PersonPage extends BaseCourseCompletionsPage {
  readonly courseCompletionRecord: LearnerDetailsComponent

  readonly deliusRecord: OffenderDetailsComponent

  constructor(
    private readonly courseCompletion: EteCourseCompletionEventDto,
    private readonly offender: OffenderFullDto,
  ) {
    super('Confirm CRN match')
    this.courseCompletionRecord = new LearnerDetailsComponent(this.courseCompletion)
    this.deliusRecord = new OffenderDetailsComponent(this.offender)
  }

  static visit(courseCompletion: EteCourseCompletionEventDto, offender: OffenderFullDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'person', id: courseCompletion.id }), {
      form: '12',
    })
    cy.visit(path)

    return new PersonPage(courseCompletion, offender)
  }

  clickEnterAnotherCrn() {
    cy.get('a').contains('Enter another CRN').click()
  }
}
