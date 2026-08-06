import { OffenderFullDto, ProjectDto } from '../../server/@types/shared'
import { Session } from '../../server/@types/user-defined'
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

  static visitForSession(session: Session, offender: OffenderFullDto) {
    const { crn, name } = new Offender(offender)
    const path = paths.sessions.create.requirement({ projectCode: session.projectCode, date: session.date, crn })
    return this.visitAndCheck(path, name)
  }

  static visitForProject(project: ProjectDto, offender: OffenderFullDto) {
    const { crn, name } = new Offender(offender)
    const path = paths.projects.create.requirement({ projectCode: project.projectCode, crn })
    return this.visitAndCheck(path, name)
  }

  selectRequirement(deliusEventNumber: number) {
    this.requirementOptions.checkOptionWithValue(deliusEventNumber.toString())
  }

  shouldShowCheckedRequirement(deliusEventNumber: number) {
    this.requirementOptions.shouldHaveSelectedValue(deliusEventNumber.toString())
  }
}
