import {
  EteCourseCompletionEventDto,
  ProjectOutcomeSummaryDto,
  ProviderTeamSummaryDto,
  UnpaidWorkDetailsDto,
} from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import SummaryListComponent from '../../components/summaryListComponent'
import { pathWithQuery } from '../../../../server/utils/utils'
import RadioGroupComponent from '../../components/radioGroupComponent'
import { CourseCompletionForm } from '../../../../server/services/forms/courseCompletionFormService'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'
import DateTimeFormats from '../../../../server/utils/dateTimeUtils'

export default class ConfirmDetailsPage extends BaseCourseCompletionsPage {
  private readonly formDetails: SummaryListComponent

  readonly alertPractitionerQuestion: RadioGroupComponent

  constructor(private readonly form: CourseCompletionForm) {
    super('Confirm details')
    this.formDetails = new SummaryListComponent()
    this.alertPractitionerQuestion = new RadioGroupComponent('alertPractitioner')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto, form: CourseCompletionForm) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'confirm', id: courseCompletion.id }), {
      form: '1',
    })
    cy.visit(path)

    return new ConfirmDetailsPage(form)
  }

  shouldShowCompletedDetails(
    team: ProviderTeamSummaryDto,
    project: ProjectOutcomeSummaryDto,
    unpaidWorkDetails: UnpaidWorkDetailsDto,
  ): void {
    this.formDetails.getValueWithLabel('CRN').should('contain.text', this.form.crn)
    this.formDetails
      .getValueWithLabel('Requirement')
      .should(
        'contain.html',
        [
          `Offence: ${unpaidWorkDetails.mainOffence.description}`,
          `Event number: ${unpaidWorkDetails.eventNumber}`,
          `Sentence date: ${DateTimeFormats.isoDateToUIDate(unpaidWorkDetails.sentenceDate)}`,
          `Status: ${unpaidWorkDetails.upwStatus}`,
        ].join('<br>'),
      )
    this.formDetails.getValueWithLabel('Project team').should('contain.text', team.name)
    this.formDetails.getValueWithLabel('Project', { exact: true }).should('contain.text', project.projectName)
  }

  clickChange(label: string) {
    this.formDetails.clickActionWithLabel(label)
  }
}
