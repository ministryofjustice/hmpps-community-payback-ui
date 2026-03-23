import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import RadioGroupComponent from '../../components/radioGroupComponent'
import LearnerDetailsComponent from '../learnerDetailsComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class RequirementPage extends BaseCourseCompletionsPage {
  readonly courseCompletionRecord: LearnerDetailsComponent

  readonly requirementOptions: RadioGroupComponent

  constructor() {
    super('Choose an unpaid work requirement')
    this.requirementOptions = new RadioGroupComponent('deliusEventNumber')
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'requirement', id: courseCompletion.id }), {
      form: '12',
    })
    cy.visit(path)

    return new RequirementPage()
  }

  selectRequirement(deliusEventNumber: number) {
    this.requirementOptions.checkOptionWithValue(deliusEventNumber.toString())
  }

  shouldShowCheckedRequirement(deliusEventNumber: number) {
    this.requirementOptions.shouldHaveSelectedValue(deliusEventNumber.toString())
  }
}
