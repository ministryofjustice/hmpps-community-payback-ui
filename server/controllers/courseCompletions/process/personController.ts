import PersonPage, { PersonPageViewData } from '../../../pages/courseCompletions/process/personPage'
import CourseCompletionService from '../../../services/courseCompletionService'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import OffenderService from '../../../services/offenderService'
import BaseController, { StepViewDataParams } from './baseController'

export default class PersonController extends BaseController<PersonPage> {
  constructor(
    page: PersonPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly offenderService: OffenderService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({
    req,
    res,
    formData,
    courseCompletion,
  }: StepViewDataParams): Promise<PersonPageViewData> {
    const crn = this.getPropertyValue({ propertyName: 'crn', req, formData })
    const { offender } = await this.offenderService.getOffenderSummary({ username: res.locals.user.username, crn })

    return Promise.resolve(this.page.stepViewData(courseCompletion, offender))
  }
}
