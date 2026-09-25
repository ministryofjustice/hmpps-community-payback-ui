import { EteCourseCompletionEventDto } from '../../../../server/@types/shared'
import { CourseCompletionPageInput } from '../../../../server/pages/courseCompletionIndexPage'
import paths from '../../../../server/paths'
import { pathWithQuery } from '../../../../server/utils/utils'
import PersonSearchComponent from '../../components/personSearchComponent'
import BaseCourseCompletionsPage from './baseCourseCompletionsPage'

export default class CrnPage extends BaseCourseCompletionsPage {
  personSearchComponent = new PersonSearchComponent()

  constructor() {
    super('Match with CRN')
  }

  static visit(
    courseCompletion: EteCourseCompletionEventDto,
    formId: string,
    originalSearch: CourseCompletionPageInput = {},
  ) {
    const path = pathWithQuery(paths.courseCompletions.process({ page: 'crn', id: courseCompletion.id }), {
      ...originalSearch,
      form: formId,
    })
    return this.visitAndCheck(path)
  }
}
