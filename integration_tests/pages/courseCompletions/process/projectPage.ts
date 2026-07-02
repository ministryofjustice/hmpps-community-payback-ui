import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import ProjectQuestionsComponent from '../../components/projectQuestionsComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class ProjectPage extends BaseCourseCompletionsPage {
  readonly form: ProjectQuestionsComponent

  constructor() {
    super('Match with a project')
    this.form = new ProjectQuestionsComponent()
  }

  static visit(courseCompletion: EteCourseCompletionEventDto) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'project', id: courseCompletion.id }), {
      form: '12',
    })
    return this.visitAndCheck(path)
  }
}
