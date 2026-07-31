import Page from './page'
import paths from '../../server/paths'
import { SessionDto } from '../../server/@types/shared'
import PersonSearchComponent from './components/personSearchComponent'

export default class FindAPersonPage extends Page {
  personSearchComponent = new PersonSearchComponent()

  constructor() {
    super('Find a person on probation')
  }

  static visit(session: SessionDto): FindAPersonPage {
    return this.visitAndCheck(paths.sessions.findAPerson({ projectCode: session.projectCode, date: session.date }))
  }
}
