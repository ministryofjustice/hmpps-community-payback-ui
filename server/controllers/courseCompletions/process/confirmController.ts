import { type Request, type RequestHandler, type Response } from 'express'

import ConfirmPage from '../../../pages/courseCompletions/process/confirmPage'
import CourseCompletionFormService, { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import ProviderService from '../../../services/providerService'
import ProjectService from '../../../services/projectService'
import OffenderService from '../../../services/offenderService'
import { UnpaidWorkDetailsDto } from '../../../@types/shared'
import GovUkRadioGroup from '../../../forms/GovUkRadioGroup'
import paths from '../../../paths'
import { catchApiValidationErrorOrPropagate, generateErrorTextList } from '../../../utils/errorUtils'

export default class ConfirmController extends BaseController<ConfirmPage> {
  constructor(
    page: ConfirmPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
    private readonly offenderService: OffenderService,
  ) {
    super(page, courseCompletionService, formService)
  }

  override submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const courseCompletionId = req.params.id.toString()

      const { formData, formId } = await this.getForm(req, res, true)
      const { offender } = await this.offenderService.getOffenderSummary({
        username: res.locals.user.username,
        crn: formData.crn,
      })

      const payload = this.page.requestBody(formData, req.body)

      try {
        await this.courseCompletionService.saveResolution(
          { id: courseCompletionId, username: res.locals.user.username },
          payload,
        )
        const successMessage = this.page.successMessage(offender)

        req.flash('success', successMessage)

        res.redirect(paths.courseCompletions.index({}))
      } catch (error) {
        catchApiValidationErrorOrPropagate(req, res, error, this.page.updatePath(courseCompletionId, formId))
      }
    }
  }

  protected override async getStepViewData({ req, formData, formId, courseCompletion, res }: StepViewDataParams) {
    const { providerCode } = courseCompletion.pdu
    const { username } = res.locals.user
    const teams = await this.providerService.getTeams(providerCode, username)
    const projects = formData.team
      ? (
          await this.projectService.getProjects({
            projectTypeGroup: 'ETE',
            username,
            providerCode,
            teamCode: formData.team,
          })
        ).content
      : []
    const unpaidWorkDetails = await this.getUnpaidWorkDetails({ username, formData })

    const personItems = this.page.personItems({
      courseCompletionId: req.params.id,
      form: formData,
      formId,
      unpaidWorkDetails,
    })

    const appointmentItems = this.page.appointmentItems({
      courseCompletionId: req.params.id,
      form: formData,
      formId,
      teams: teams.providers,
      projects,
    })

    const alertPractitionerItems = GovUkRadioGroup.yesNoItems({})

    const errorList = generateErrorTextList(res.locals.errorMessages)

    return {
      personItems,
      appointmentItems,
      alertPractitionerItems,
      errorList,
    }
  }

  private async getUnpaidWorkDetails({
    username,
    formData,
  }: {
    username: string
    formData: CourseCompletionForm
  }): Promise<UnpaidWorkDetailsDto | null> {
    if (!formData.crn || !formData.deliusEventNumber) {
      return null
    }

    const caseDetails = await this.offenderService.getOffenderSummary({ username, crn: formData.crn })

    const filteredCaseDetails = caseDetails.unpaidWorkDetails.filter(
      upwDetail => upwDetail.eventNumber === formData.deliusEventNumber,
    )

    if (filteredCaseDetails.length === 1) {
      return filteredCaseDetails[0]
    }

    return null
  }
}
