import RequirementPage from '../../../pages/courseCompletions/process/requirementPage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import OffenderService from '../../../services/offenderService'

export default class RequirementController extends BaseController<RequirementPage> {
  constructor(
    page: RequirementPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly offenderService: OffenderService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({ res, req, formData }: StepViewDataParams) {
    const crn = this.getPropertyValue({ propertyName: 'crn', req, formData })
    const deliusEventNumber = this.getPropertyValue({ propertyName: 'deliusEventNumber', req, formData })

    const { unpaidWorkDetails } = await this.offenderService.getOffenderSummary({
      username: res.locals.user.username,
      crn,
    })

    const unpaidWorkOptions = this.page.getUnpaidWorkOptions(unpaidWorkDetails, deliusEventNumber)

    return { unpaidWorkOptions }
  }
}
