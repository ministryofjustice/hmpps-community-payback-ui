import { OffenderFullDto, SessionDto } from '../../server/@types/shared'
import Offender from '../../server/models/offender'
import paths from '../../server/paths'
import RadioOrCheckboxGroupComponent from './components/radioOrCheckboxGroupComponent'
import Page from './page'

export default class RequirementPage extends Page {
  readonly requirementOptions: RadioOrCheckboxGroupComponent

  constructor(name: string) {
    super(name)
    this.requirementOptions = new RadioOrCheckboxGroupComponent('deliusEventNumber')
  }

  static visit(session: SessionDto, offender: OffenderFullDto) {
    const { crn, name } = new Offender(offender)
    const path = paths.sessions.create.requirement({ projectCode: session.projectCode, date: session.date, crn })
    return this.visitAndCheck(path, name)
  }

  selectRequirement(deliusEventNumber: number) {
    this.requirementOptions.checkOptionWithValue(deliusEventNumber.toString())
  }

  shouldShowCheckedRequirement(deliusEventNumber: number) {
    this.requirementOptions.shouldHaveSelectedValue(deliusEventNumber.toString())
  }
}
