import OutcomePage, { OutcomePageBody } from '../../../pages/courseCompletions/process/outcomePage'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController, { StepViewDataParams } from './baseController'
import GovukFrontendDateInput, { GovUkFrontendDateInputItem } from '../../../forms/GovukFrontendDateInput'
import {
  CourseCompletionSortField,
  GovUkSummaryListItem,
  ValidationErrors,
  ViewDataWithNotes,
  ViewDataWithTimeToCredit,
} from '../../../@types/user-defined'
import CourseCompletionUtils, { CourseDetails } from '../../../utils/courseCompletionUtils'
import { UnpaidWorkHoursDetails } from '../../../utils/unpaidWorkUtils'
import OffenderService from '../../../services/offenderService'
import NotesUtils from '../../../utils/notesUtils'
import AppointmentService from '../../../services/appointmentService'
import paths from '../../../paths'
import { getPaginationRequestParams } from '../../../utils/paginationUtils'
import { EteCourseCompletionEventDto } from '../../../@types/shared'

type ViewData = {
  dateItems: Array<GovUkFrontendDateInputItem>
  courseDetailsItems: CourseDetails
  requirementDetailsItems?: UnpaidWorkHoursDetails
  completionDetailsRows: GovUkSummaryListItem[]
  courseCompletion: EteCourseCompletionEventDto
} & ViewDataWithNotes &
  ViewDataWithTimeToCredit

export default class OutcomeController extends BaseController<OutcomePage> {
  constructor(
    page: OutcomePage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly offenderService: OffenderService,
    private readonly appointmentService: AppointmentService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData({
    req,
    res,
    formData,
    errors,
    courseCompletion,
  }: StepViewDataParams): Promise<ViewData> {
    const appointment = formData.appointmentIdToUpdate
      ? await this.appointmentService.getAppointment({
          projectCode: formData.project,
          appointmentId: formData.appointmentIdToUpdate?.toString(),
          username: res.locals.user.username,
        })
      : undefined
    const timeToCredit = {
      hours: this.getPropertyValue({ propertyName: 'hours', req, formData: formData.timeToCredit ?? {} }),
      minutes: this.getPropertyValue({ propertyName: 'minutes', req, formData: formData.timeToCredit ?? {} }),
    }
    const date = {
      day: this.getPropertyValue({ propertyName: 'date-day', req, formData }),
      month: this.getPropertyValue({ propertyName: 'date-month', req, formData }),
      year: this.getPropertyValue({ propertyName: 'date-year', req, formData }),
    }
    const hasDateError = (errors as ValidationErrors<OutcomePageBody>)['date-day'] !== undefined
    const dateItems = GovukFrontendDateInput.getDateItemsFromStructuredDate(date, hasDateError)

    const courseDetailsItems = CourseCompletionUtils.formattedCourseDetails(courseCompletion)

    const { unpaidWorkDetails } = await this.offenderService.getOffenderSummary({
      username: res.locals.user.username,
      crn: formData.crn,
    })

    const { sortBy, sortDirection } = getPaginationRequestParams<CourseCompletionSortField>(
      req,
      paths.courseCompletions.search({}),
    )

    const courseCompletions = await this.courseCompletionService.searchCourseCompletions({
      username: res.locals.user.username,
      providerCode: courseCompletion.pdu.providerCode,
      pduId: courseCompletion.pdu.id,
      sortBy,
      sortDirection,
      resolutionStatus: 'Unresolved',
      showCourseFailures: 'Yes',
      externalReference: courseCompletion.externalReference,
    })

    const requirementDetailsItems = this.page.requirementDetailsItems(unpaidWorkDetails, formData.deliusEventNumber)

    return {
      ...NotesUtils.questionItems(req.body ?? {}, formData, appointment),
      timeToCredit,
      dateItems,
      courseDetailsItems,
      requirementDetailsItems,
      completionDetailsRows: CourseCompletionUtils.completionDetailsRows({
        courseCompletion,
        allCourseCompletions: courseCompletions.content,
      }),
      courseCompletion,
    }
  }
}
