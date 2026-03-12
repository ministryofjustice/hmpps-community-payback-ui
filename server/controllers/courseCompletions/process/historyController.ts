import type { Request, Response } from 'express'

import HistoryPage from '../../../pages/courseCompletions/process/historyPage'
import CourseCompletionFormService, { CourseCompletionForm } from '../../../services/forms/courseCompletionFormService'
import CourseCompletionService from '../../../services/courseCompletionService'
import BaseController from './baseController'
import { EteCourseCompletionEventDto } from '../../../@types/shared'
import AppointmentService from '../../../services/appointmentService'
import { GetAppointmentsRequest } from '../../../data/appointmentClient'
import DateTimeFormats from '../../../utils/dateTimeUtils'

export default class HistoryController extends BaseController<HistoryPage> {
  constructor(
    page: HistoryPage,
    courseCompletionService: CourseCompletionService,
    formService: CourseCompletionFormService,
    private readonly appointmentService: AppointmentService,
  ) {
    super(page, courseCompletionService, formService)
  }

  protected override async getStepViewData(
    _req: Request,
    res: Response,
    _courseCompletion: EteCourseCompletionEventDto,
    form?: CourseCompletionForm,
    _formId?: string,
  ) {
    const appointmentRequest: GetAppointmentsRequest = {
      projectTypeGroup: 'ETE',
      outcomeCodes: ['ATTC'],
      toDate: DateTimeFormats.dateObjToIsoString(new Date()),
      fromDate: DateTimeFormats.getTodaysDatePlusDays(-365).formattedDate,
      crn: form.crn,
    }
    const appointments = await this.appointmentService.getAppointments(res.locals.user.username, appointmentRequest)
    return this.page.stepViewData(appointments.content)
  }
}
