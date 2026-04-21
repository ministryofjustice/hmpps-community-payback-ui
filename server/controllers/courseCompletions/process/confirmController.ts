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
import { catchApiValidationErrorOrPropagate, generateErrorTextList } from '../../../utils/errorUtils'
import AppointmentService from '../../../services/appointmentService'
import DateTimeFormats from '../../../utils/dateTimeUtils'
import { pathWithQuery } from '../../../utils/utils'
import paths from '../../../paths'

export default class ConfirmController extends BaseController<ConfirmPage> {
  constructor(
    page: ConfirmPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly providerService: ProviderService,
    private readonly projectService: ProjectService,
    private readonly offenderService: OffenderService,
    private readonly appointmentService: AppointmentService,
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

        res.redirect(this.buildNextPath(formData))
      } catch (error) {
        catchApiValidationErrorOrPropagate(req, res, error, this.page.updatePath(courseCompletionId, formId))
      }
    }
  }

  private buildNextPath(formData: CourseCompletionForm) {
    const { originalSearch } = formData

    if (!originalSearch || Object.keys(originalSearch).length === 0) {
      return paths.courseCompletions.index({})
    }
    return pathWithQuery(paths.courseCompletions.search({}), formData.originalSearch)
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

    const appointments = await this.appointmentService.getAppointments(res.locals.user.username, {
      crn: formData.crn,
      projectTypeGroup: 'ETE',
      outcomeCodes: ['NO_OUTCOME'],
      projectCodes: [formData.project],
      fromDate: DateTimeFormats.dateObjToIsoString(new Date()),
    })

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
      canChangeAppointment: appointments.content.length > 0,
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
