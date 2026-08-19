import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import AppointmentsController from './appointmentsController'
import AppointmentFormService, { APPOINTMENT_UPDATE_FORM_TYPE } from '../../services/forms/appointmentFormService'
import ProjectService from '../../services/projectService'
import projectFactory from '../../testutils/factories/projectFactory'
import appointmentOutcomeFormFactory from '../../testutils/factories/appointmentOutcomeFormFactory'
import paths from '../../paths'
import { pathWithQuery } from '../../utils/utils'
import AppointmentService from '../../services/appointmentService'
import OffenderService from '../../services/offenderService'
import caseDetailsSummaryFactory from '../../testutils/factories/caseDetailsSummaryFactory'
import Offender from '../../models/offender'
import unpaidWorkDetailsFactory from '../../testutils/factories/unpaidWorkDetailsFactory'
import { ViewAppointmentsPage } from '../../pages/appointments/viewAppointmentsPage'
import DateTimeFormats from '../../utils/dateTimeUtils'

describe('AppointmentsController', () => {
  const username = 'user'
  const crn = 'X123456'
  const deliusEventNumber = '1'
  const projectCode = '2'
  const date = '2026-01-01'
  const formId = 'some-form-id'
  const projectTypeGroup = ['GROUP', 'INDIVIDUAL', 'INDUCTION']

  const request = createMock<Request>({
    params: { crn, deliusEventNumber, projectCode, date },
    query: { provider: 'provider-code' },
  })
  const response = createMock<Response>({ locals: { user: { username } } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const formService = createMock<AppointmentFormService>()
  const projectService = createMock<ProjectService>()
  const offenderService = createMock<OffenderService>()
  const appointmentService = createMock<AppointmentService>()

  let controller: AppointmentsController

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new AppointmentsController(formService, projectService, offenderService, appointmentService)
  })

  describe('create', () => {
    it('should create a new appointment form and redirect to the choose project page', async () => {
      const project = projectFactory.build({ projectCode })

      projectService.getProject.mockResolvedValue(project)
      formService.createNewAppointmentForm.mockResolvedValue({
        key: { id: formId, type: APPOINTMENT_UPDATE_FORM_TYPE },
        data: undefined,
      })

      const requestHandler = controller.create()
      await requestHandler(request, response, next)

      expect(projectService.getProject).toHaveBeenCalledWith({ username, projectCode })

      expect(formService.createNewAppointmentForm).toHaveBeenCalledWith({
        username,
        query: request.query,
        crn,
        deliusEventNumber,
        project,
        date,
      })

      expect(response.redirect).toHaveBeenCalledWith(
        pathWithQuery(paths.appointments.create({ projectCode, page: 'date' }), {
          form: formId,
        }),
      )
    })

    it('should update the existing form with the new crn and deliusEventNumber and redirect without creating a new form when form is present in query', async () => {
      const project = projectFactory.build({ projectCode })
      const existingFormData = appointmentOutcomeFormFactory.build()

      projectService.getProject.mockResolvedValue(project)
      formService.getForm.mockResolvedValue(existingFormData)

      const requestWithForm = createMock<Request>({
        params: { crn, deliusEventNumber, projectCode, date },
        query: { form: formId },
      })

      const requestHandler = controller.create()
      await requestHandler(requestWithForm, response, next)

      expect(formService.createNewAppointmentForm).not.toHaveBeenCalled()
      expect(formService.getForm).toHaveBeenCalledWith(formId, username)
      expect(formService.saveForm).toHaveBeenCalledWith(formId, username, {
        ...existingFormData,
        deliusEventNumber,
        crn,
      })

      expect(response.redirect).toHaveBeenCalledWith(
        pathWithQuery(paths.appointments.create({ projectCode, page: 'date' }), {
          form: formId,
        }),
      )
    })
  })

  describe('show', () => {
    describe('with one requirement', () => {
      it('renders the page with correct data', async () => {
        const caseDetailsSummary = caseDetailsSummaryFactory.build({
          unpaidWorkDetails: [
            unpaidWorkDetailsFactory.build({
              eventNumber: parseInt(deliusEventNumber, 10),
            }),
          ],
        })

        offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

        const req = createMock<Request>({
          params: { crn, deliusEventNumber, appointmentSection: 'upcoming' },
          query: {},
        })
        jest.spyOn(ViewAppointmentsPage, 'buildAppointmentList').mockReturnValue([])
        jest.spyOn(ViewAppointmentsPage, 'buildNavigation').mockReturnValue([])

        const requestHandler = controller.show()
        await requestHandler(req, response, next)

        expect(response.render).toHaveBeenCalledWith('appointments/show', {
          person: new Offender(caseDetailsSummary.offender),
          unpaidWorkDetail: caseDetailsSummary.unpaidWorkDetails[0],
          changeLink: paths.people.requirement({ crn }),
          withChangeLink: false,
          backPath: paths.people.find({}),
          notFoundText: 'This person has no upcoming appointments',
          appointmentList: [],
          navItems: [],
        })
      })
    })

    describe('with multiple requirements', () => {
      it('renders the page with correct data', async () => {
        const caseDetailsSummary = caseDetailsSummaryFactory.build({
          unpaidWorkDetails: [
            unpaidWorkDetailsFactory.build({
              eventNumber: parseInt(deliusEventNumber, 10),
            }),
          ],
        })

        caseDetailsSummary.unpaidWorkDetails = [
          caseDetailsSummary.unpaidWorkDetails[0],
          ...unpaidWorkDetailsFactory.buildList(5),
        ]

        offenderService.getOffenderSummary.mockResolvedValue(caseDetailsSummary)

        const req = createMock<Request>({
          params: { crn, deliusEventNumber, appointmentSection: 'upcoming' },
          query: {},
        })
        jest.spyOn(ViewAppointmentsPage, 'buildAppointmentList').mockReturnValue([])
        jest.spyOn(ViewAppointmentsPage, 'buildNavigation').mockReturnValue([])

        const requestHandler = controller.show()
        await requestHandler(req, response, next)

        expect(response.render).toHaveBeenCalledWith('appointments/show', {
          person: new Offender(caseDetailsSummary.offender),
          unpaidWorkDetail: caseDetailsSummary.unpaidWorkDetails[0],
          changeLink: paths.people.requirement({ crn }),
          withChangeLink: true,
          backPath: paths.people.requirement({ crn }),
          notFoundText: 'This person has no upcoming appointments',
          appointmentList: [],
          navItems: [],
        })
      })
    })

    describe('for upcoming appointments', () => {
      beforeEach(() => {
        jest.restoreAllMocks()
      })

      it('generates the correct query', async () => {
        const req = createMock<Request>({
          params: { crn, deliusEventNumber, appointmentSection: 'upcoming' },
          query: {},
        })

        appointmentService.getAppointments.mockResolvedValue({
          content: [],
          page: {
            totalElements: 0,
          },
        })

        const now = new Date()
        const today = DateTimeFormats.dateObjToIsoString(now)

        const requestHandler = controller.show()
        await requestHandler(req, response, next)

        expect(appointmentService.getAppointments).toHaveBeenCalledWith(expect.anything(), {
          crn,
          eventNumber: deliusEventNumber,
          projectTypeGroup,
          fromDate: today,
        })
      })

      it('renders the appropriate tabbed section', async () => {
        const req = createMock<Request>({
          params: { crn, deliusEventNumber, appointmentSection: 'upcoming' },
          query: {},
        })

        const requestHandler = controller.show()
        await requestHandler(req, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/show',
          expect.objectContaining({
            notFoundText: 'This person has no upcoming appointments',
            navItems: expect.arrayContaining([{ html: 'Upcoming appointments', active: true, href: 'upcoming' }]),
          }),
        )
      })
    })

    describe('for past appointments', () => {
      it('generates the correct query', async () => {
        const req = createMock<Request>({
          params: { crn, deliusEventNumber, appointmentSection: 'past' },
          query: {},
        })

        appointmentService.getAppointments.mockResolvedValue({
          content: [],
          page: {
            totalElements: 0,
          },
        })

        const now = new Date()
        const yesterday = DateTimeFormats.dateObjToIsoString(new Date(now.setDate(now.getDate() - 1)))

        const requestHandler = controller.show()
        await requestHandler(req, response, next)

        expect(appointmentService.getAppointments).toHaveBeenCalledWith(expect.anything(), {
          crn,
          eventNumber: deliusEventNumber,
          outcomeCodes: ['WITH_OUTCOME'],
          projectTypeGroup,
          toDate: yesterday,
        })
      })

      it('renders the appropriate tabbed section', async () => {
        const req = createMock<Request>({
          params: { crn, deliusEventNumber, appointmentSection: 'past' },
          query: {},
        })

        const requestHandler = controller.show()
        await requestHandler(req, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/show',
          expect.objectContaining({
            notFoundText: 'This person has no past appointments',
            navItems: expect.arrayContaining([{ html: 'Past appointments', active: true, href: 'past' }]),
          }),
        )
      })
    })

    describe('for missing outcomes', () => {
      it('generates the correct query', async () => {
        const req = createMock<Request>({
          params: { crn, deliusEventNumber, appointmentSection: 'missing-outcomes' },
          query: {},
        })

        appointmentService.getAppointments.mockResolvedValue({
          content: [],
          page: {
            totalElements: 0,
          },
        })

        const requestHandler = controller.show()
        await requestHandler(req, response, next)

        expect(appointmentService.getAppointments).toHaveBeenCalledWith(expect.anything(), {
          crn,
          eventNumber: deliusEventNumber,
          outcomeCodes: ['NO_OUTCOME'],
          projectTypeGroup,
        })
      })

      it('renders the appropriate tabbed section', async () => {
        const req = createMock<Request>({
          params: { crn, deliusEventNumber, appointmentSection: 'missing-outcomes' },
          query: {},
        })

        appointmentService.getAppointments.mockResolvedValue({
          content: [],
          page: {
            totalElements: 0,
          },
        })

        const requestHandler = controller.show()
        await requestHandler(req, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/show',
          expect.objectContaining({
            notFoundText: 'This person has no missing outcomes',
            navItems: expect.arrayContaining([{ html: 'Missing outcomes', active: true, href: 'missing-outcomes' }]),
          }),
        )
      })

      it('has an appropriate missing outcomes count', async () => {
        const count = 5
        const req = createMock<Request>({
          params: { crn, deliusEventNumber, appointmentSection: 'missing-outcomes' },
          query: {},
        })

        appointmentService.getAppointments.mockResolvedValue({
          content: [],
          page: {
            totalElements: count,
          },
        })

        const requestHandler = controller.show()
        await requestHandler(req, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'appointments/show',
          expect.objectContaining({
            navItems: expect.arrayContaining([
              {
                html: expect.stringContaining(`<span aria-hidden="true">${count}</span>`),
                active: true,
                href: 'missing-outcomes',
              },
            ]),
          }),
        )
      })
    })
  })
})
