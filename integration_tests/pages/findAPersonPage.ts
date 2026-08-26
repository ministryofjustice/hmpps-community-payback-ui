import Page from './page'
import paths from '../../server/paths'
import { ProjectDto } from '../../server/@types/shared'
import { Session } from '../../server/@types/user-defined'
import PersonSearchComponent from './components/personSearchComponent'

export default class FindAPersonPage extends Page {
  personSearchComponent = new PersonSearchComponent()

  constructor() {
    super('Find a person with a community payback requirement')
  }

  static visitForSession(session: Session): FindAPersonPage {
    return this.visitAndCheck(
      paths.sessions.create.findAPerson({ projectCode: session.projectCode, date: session.date }),
    )
  }

  static visitForProject(project: ProjectDto): FindAPersonPage {
    return this.visitAndCheck(paths.projects.create.findAPerson({ projectCode: project.projectCode }))
  }
}
