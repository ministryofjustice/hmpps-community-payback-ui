import type { Request, RequestHandler, Response } from 'express'

import AppointmentFormService, { CreateAppointmentForm } from '../../services/forms/appointmentFormService'
import paths from '../../paths'
import { pathWithQuery } from '../../utils/utils'
import ProjectService from '../../services/projectService'
import OffenderService from '../../services/offenderService'
import Offender from '../../models/offender'
import AppointmentService from '../../services/appointmentService'
import { ViewAppointmentsPage } from '../../pages/appointments/viewAppointmentsPage'
import { AppointmentsSortField, ViewAppointmentsNavigationTabValues } from '../../@types/user-defined'
import { GetAppointmentsRequest } from '../../data/appointmentClient'
import DateTimeFormats from '../../utils/dateTimeUtils'
import { ProjectTypeDto } from '../../@types/shared'
import config from '../../config'
import { getPaginationRequestParams } from '../../utils/paginationUtils'

export const appointmentsSortFields = ['date'] as const

export default class AppointmentsController {
  constructor(
    private readonly formService: AppointmentFormService,
    private readonly projectService: ProjectService,
    private readonly offenderService: OffenderService,
    private readonly appointmentService: AppointmentService,
  ) {}

  createForProject(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, deliusEventNumber, projectCode, date } = req.params
      const { username } = res.locals.user

      const project = await this.projectService.getProject({ username, projectCode })

      const form = req.query?.form?.toString()

      let id = form

      if (form) {
        const formData = (await this.formService.getForm(form, username)) as CreateAppointmentForm
        await this.formService.saveForm(form, username, {
          ...formData,
          deliusEventNumber,
          crn,
        })
      } else {
        const newForm = await this.formService.createNewAppointmentForm({
          username,
          query: req.query as Record<string, string>,
          crn,
          deliusEventNumber,
          project,
          date,
          originalParams: { projectCode, date },
          projectTypeGroup: project.projectType.group,
          options: {
            showPersonQuestions: true,
          },
        })
        id = newForm.key.id
      }

      res.redirect(
        pathWithQuery(paths.appointments.create({ page: 'date' }), {
          form: id,
        }),
      )
    }
  }

  createForPerson(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, deliusEventNumber, projectTypeGroup } = req.params
      const { username } = res.locals.user

      res.locals.audit = {
        subjectType: 'CRN',
        subjectId: crn,
      }

      const form = await this.formService.createNewAppointmentForm({
        username,
        query: req.query as Record<string, string>,
        crn,
        deliusEventNumber,
        originalParams: { crn, deliusEventNumber },
        projectTypeGroup: projectTypeGroup as ProjectTypeDto['group'],
        options: {
          showPersonQuestions: false,
        },
      })

      res.redirect(
        pathWithQuery(paths.appointments.create({ page: 'date' }), {
          form: form.key.id,
        }),
      )
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, deliusEventNumber } = req.params

      const { unpaidWorkDetails, offender } = await this.offenderService.getOffenderSummary({
        username: res.locals.user.username,
        crn,
      })

      const baseApointmentsFilterParams = {
        crn,
        eventNumber: deliusEventNumber,
        projectTypeGroup: ['GROUP', 'INDIVIDUAL', 'INDUCTION'],
      } as GetAppointmentsRequest
      let appointmentsFilterParams = { ...baseApointmentsFilterParams }
      let notFoundText = 'This person has no '

      const date = new Date()
      const today = DateTimeFormats.dateObjToIsoString(date)
      const yesterday = DateTimeFormats.dateObjToIsoString(new Date(date.setDate(date.getDate() - 1)))

      const appointmentSection = req.params.appointmentSection as ViewAppointmentsNavigationTabValues['path']

      switch (appointmentSection) {
        case 'missing-outcomes':
          notFoundText += 'missing outcomes'
          appointmentsFilterParams = {
            ...appointmentsFilterParams,
            outcomeCodes: ['NO_OUTCOME'],
          }
          break
        case 'past':
          notFoundText += 'past appointments'
          appointmentsFilterParams = {
            ...appointmentsFilterParams,
            toDate: yesterday,
            outcomeCodes: ['WITH_OUTCOME'],
          }
          break
        default:
          notFoundText += 'upcoming appointments'
          appointmentsFilterParams = {
            ...appointmentsFilterParams,
            fromDate: today,
          }
      }

      const { page, hrefPrefix, sortBy, sortDirection, size, sort } = getPaginationRequestParams<AppointmentsSortField>(
        req,
        paths.people.appointments({
          deliusEventNumber,
          crn,
          appointmentSection,
        }),
        'date',
        appointmentsSortFields,
      )

      const appointments = await this.appointmentService.getAppointments(res.locals.user.username, {
        ...appointmentsFilterParams,
        page,
        size,
        sort,
      })

      let missingOutcomeCount = 0

      if (appointmentSection !== 'missing-outcomes') {
        missingOutcomeCount = (
          await this.appointmentService.getAppointments(res.locals.user.username, {
            ...baseApointmentsFilterParams,
            outcomeCodes: ['NO_OUTCOME'],
          })
        ).page.totalElements
      } else {
        missingOutcomeCount = appointments.page.totalElements
      }

      const person = new Offender(offender)

      const navItems = ViewAppointmentsPage.buildNavigation(req.params.appointmentSection, missingOutcomeCount)

      const appointmentList = ViewAppointmentsPage.buildAppointmentList(appointments.content)

      const unpaidWorkDetail = unpaidWorkDetails.filter(
        detail => detail.eventNumber === parseInt(deliusEventNumber, 10),
      )[0]

      const withChangeLink = unpaidWorkDetails.length > 1
      const changeLink = paths.people.requirement({ crn })

      const inductionProjectType: ProjectTypeDto['group'] = 'INDUCTION'
      const createAppointmentPath =
        config.featureFlags.findAPersonEnabled && config.featureFlags.createAppointmentEnabled
          ? paths.people.createAppointment({
              crn,
              deliusEventNumber,
              projectTypeGroup: inductionProjectType,
            })
          : undefined
      const tableHeaders = ViewAppointmentsPage.tableHeaders(sortBy, sortDirection ?? 'asc', hrefPrefix)

      res.render('appointments/show', {
        person,
        unpaidWorkDetail,
        withChangeLink,
        changeLink,
        navItems,
        appointmentList,
        tableHeaders,
        notFoundText,
        pageNumber: appointments.page.number,
        totalPages: appointments.page.totalPages,
        totalElements: appointments.page.totalElements,
        pageSize: appointments.page.size,
        hrefPrefix,
        backPath: withChangeLink ? changeLink : paths.people.find({}),
        createAppointmentPath,
      })
    }
  }
}
