import PersonPage, { PersonPageViewData } from '../../../pages/courseCompletions/process/personPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import BaseController, { StepViewDataParams } from './baseController'

export default class PersonController extends BaseController<PersonPage> {
  constructor(
    page: PersonPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override getStepViewData({ courseCompletion }: StepViewDataParams): Promise<PersonPageViewData> {
    return Promise.resolve(this.page.stepViewData(courseCompletion))
  }
}
