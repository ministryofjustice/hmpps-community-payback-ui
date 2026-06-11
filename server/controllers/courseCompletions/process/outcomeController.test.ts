import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import OutcomeController from './outcomeController'
import CourseCompletionService from '../../../services/courseCompletionService'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import GovukFrontendDateInput from '../../../forms/GovukFrontendDateInput'
import CourseCompletionUtils from '../../../utils/courseCompletionUtils'
import OffenderService from '../../../services/offenderService'
import unpaidWorkDetailsFactory from '../../../testutils/factories/unpaidWorkDetailsFactory'
import offenderFullFactory from '../../../testutils/factories/offenderFullFactory'
import appointmentFactory from '../../../testutils/factories/appointmentFactory'
import NotesUtils from '../../../utils/notesUtils'
import { GovUkSummaryListItem, YesOrNo } from '../../../@types/user-defined'
import AppointmentService from '../../../services/appointmentService'

describe('OutcomeController', () => {
  const username = 'username'
  const response = createMock<Response>({ locals: { user: { username } } })
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const offenderService = createMock<OffenderService>()
  const appointmentService = createMock<AppointmentService>()
  const courseCompletion = courseCompletionFactory.build()
  const unpaidWorkDetails = unpaidWorkDetailsFactory.buildList(2)

  let outcomeController: OutcomeController
  const page = createMock<OutcomePage>({ templatePath })
  const courseDetailsItems = {
    completionDate: '12 July 2025',
    expectedTime: '42 hours',
    expectedTimeWithAllowance: '50 hours',
    totalTimeSpent: '1 hour 20 minutes',
  }
  const requirementDetailsItems = {
    totalHoursOrdered: '3 hours 0 minutes',
    maximumEteHours: '1 hour 30 minutes',
    eteHoursCredited: '1 hour 0 minutes',
    eteHoursRemaining: '30 minutes',
    totalHoursRemaining: '2 hours 0 minutes',
  }

  const mockCompletionDetailsRow = [{ key: { title: 'Attempt 1' } } as unknown as GovUkSummaryListItem]

  beforeEach(() => {
    jest.resetAllMocks()
    outcomeController = new OutcomeController(
      page,
      courseCompletionService,
      formService,
      offenderService,
      appointmentService,
    )
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue({})
    jest
      .spyOn(NotesUtils, 'questionItems')
      .mockReturnValue({ notes: undefined, isSensitiveItems: [], showIsSensitiveQuestion: false })
    jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate').mockReturnValue([])
    jest.spyOn(CourseCompletionUtils, 'formattedCourseDetails').mockReturnValue(courseDetailsItems)

    offenderService.getOffenderSummary.mockResolvedValue({
      unpaidWorkDetails,
      offender: offenderFullFactory.build(),
    })
    page.requirementDetailsItems.mockReturnValue(requirementDetailsItems)
    jest.spyOn(CourseCompletionUtils, 'completionDetailsRows').mockReturnValue(mockCompletionDetailsRow)
  })

  describe('show', () => {
    it('should render the page', async () => {
      const form = courseCompletionFormFactory.build({ notes: undefined, timeToCredit: undefined })
      formService.getForm.mockResolvedValue(form)

      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' }, body: {} })

      const requestHandler = outcomeController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        timeToCredit: { hours: undefined, minutes: undefined },
        dateItems: [],
        notes: undefined,
        isSensitiveItems: [],
        showIsSensitiveQuestion: false,
        courseDetailsItems,
        requirementDetailsItems,
        courseCompletion,
        completionDetailsRows: mockCompletionDetailsRow,
      })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
      expect(CourseCompletionUtils.formattedCourseDetails).toHaveBeenCalledWith(courseCompletion)
      expect(offenderService.getOffenderSummary).toHaveBeenCalledWith({ username, crn: form.crn })
      expect(page.requirementDetailsItems).toHaveBeenCalledWith(unpaidWorkDetails, form.deliusEventNumber)
    })

    it('returns values from form if not undefined', async () => {
      const showPath = '/show'
      const formId = '12'
      const timeToCredit = { hours: '1', minutes: '30' }
      const form = courseCompletionFormFactory.build({ timeToCredit, appointmentIdToUpdate: undefined })
      formService.getForm.mockResolvedValue(form)
      const dateItems = [
        { name: 'day', classes: '', value: '01' },
        { name: 'month', classes: '', value: '02' },
      ]
      jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate').mockReturnValue(dateItems)
      const isSensitiveItems = [{ text: 'Yes', value: 'yes' as YesOrNo, checked: true }]
      const notesItems = { isSensitiveItems, notes: form.notes, showIsSensitiveQuestion: true }
      jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)
      page.updatePath.mockReturnValue(showPath)
      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: {} })

      const requestHandler = outcomeController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        ...notesItems,
        timeToCredit,
        dateItems,
        courseDetailsItems,
        requirementDetailsItems,
        courseCompletion,
        completionDetailsRows: mockCompletionDetailsRow,
      })

      expect(GovukFrontendDateInput.getDateItemsFromStructuredDate).toHaveBeenLastCalledWith(
        {
          day: form['date-day'],
          month: form['date-month'],
          year: form['date-year'],
        },
        false,
      )

      expect(NotesUtils.questionItems).toHaveBeenCalledWith({}, form, undefined)
    })

    it('fetches appointment if form has appointmentIdToUpdate', async () => {
      const appointmentId = 123
      const projectCode = 'PROJECT123'
      const form = courseCompletionFormFactory.build({
        appointmentIdToUpdate: appointmentId,
        project: projectCode,
      })
      formService.getForm.mockResolvedValue(form)

      const appointment = appointmentFactory.build({ sensitive: true })
      appointmentService.getAppointment.mockResolvedValue(appointment)

      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' }, body: {} })

      const requestHandler = outcomeController.show()
      await requestHandler(request, response, next)

      expect(appointmentService.getAppointment).toHaveBeenCalledWith({
        projectCode,
        appointmentId: appointmentId.toString(),
        username,
      })

      expect(NotesUtils.questionItems).toHaveBeenCalledWith({}, form, appointment)
    })
  })

  describe('submit', () => {
    it('redirects to the next page', async () => {
      const nextPath = '/next'
      page.nextPath.mockReturnValue(nextPath)
      page.validationErrors.mockReturnValue({ hasErrors: false, errors: {}, errorSummary: [] })

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' }, body: {} })

      const requestHandler = outcomeController.submit()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(nextPath)
      expect(formService.getForm).toHaveBeenCalledTimes(1)
      expect(formService.saveForm).toHaveBeenCalled()
    })

    it('rerenders page if validation errors', async () => {
      const crn = 'some-crn'
      const deliusEventNumber = 1
      formService.getForm.mockResolvedValue({ crn, deliusEventNumber, appointmentIdToUpdate: undefined })
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)

      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]
      const errors = { hours: { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate').mockReturnValue([])

      const request = createMock<Request>({ params: { id: '1' }, query: { form: '12' }, body: {} })

      const requestHandler = outcomeController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        errors,
        errorSummary,
        timeToCredit: { hours: undefined, minutes: undefined },
        dateItems: [],
        isSensitiveItems: [],
        notes: undefined,
        courseDetailsItems,
        requirementDetailsItems,
        showIsSensitiveQuestion: false,
        courseCompletion,
        completionDetailsRows: mockCompletionDetailsRow,
      })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
      expect(CourseCompletionUtils.formattedCourseDetails).toHaveBeenCalledWith(courseCompletion)

      expect(GovukFrontendDateInput.getDateItemsFromStructuredDate).toHaveBeenLastCalledWith({}, false)
      expect(offenderService.getOffenderSummary).toHaveBeenCalledWith({ username, crn })
      expect(page.requirementDetailsItems).toHaveBeenCalledWith(unpaidWorkDetails, deliusEventNumber)
    })

    it('returns values in saved form if not undefined', async () => {
      const showPath = '/show'
      const formId = '12'
      const teamCode = '13'
      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)
      page.updatePath.mockReturnValue(showPath)

      const timeToCredit = { hours: '1', minutes: '30' }
      const form = courseCompletionFormFactory.build({ timeToCredit, appointmentIdToUpdate: undefined })
      formService.getForm.mockResolvedValue(form)

      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]
      const errors = { hours: { text: 'Error' }, 'date-day': { text: 'error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const dateItems = [
        { name: 'day', classes: '', value: '01' },
        { name: 'month', classes: '', value: '02' },
      ]
      jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate').mockReturnValue(dateItems)

      const isSensitiveItems = [{ text: 'Yes', value: 'yes' as YesOrNo, checked: false }]
      const notesItems = {
        notes: 'some',
        isSensitiveItems,
        showIsSensitiveQuestion: true,
      }
      jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

      const body = { team: teamCode }
      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body })

      const requestHandler = outcomeController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        ...notesItems,
        errors,
        errorSummary,
        timeToCredit,
        dateItems,
        courseDetailsItems,
        requirementDetailsItems,
        courseCompletion,
        completionDetailsRows: mockCompletionDetailsRow,
      })

      expect(GovukFrontendDateInput.getDateItemsFromStructuredDate).toHaveBeenLastCalledWith(
        {
          day: form['date-day'],
          month: form['date-month'],
          year: form['date-year'],
        },
        true,
      )

      expect(NotesUtils.questionItems).toHaveBeenCalledWith(body, form, undefined)
    })

    it('uses values from request body over form data', async () => {
      const form = courseCompletionFormFactory.build({ appointmentIdToUpdate: undefined })
      formService.getForm.mockResolvedValue(form)
      const formId = '12'
      const notes = 'some note'

      const viewData = {
        backLink: '/back',
        updatePath: '/update',
        communityCampusPerson: { name: 'Mary Smith' },
        courseName: 'Customer service',
        unableToCreditTimePath: '/unable-to-credit-time',
      }
      page.viewData.mockReturnValue(viewData)

      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]
      const errors = { 'date-day': { text: 'Error' } }
      page.validationErrors.mockReturnValue({ hasErrors: true, errors, errorSummary })

      const dateItems = [
        { name: 'day', classes: '', value: '01' },
        { name: 'month', classes: '', value: '02' },
      ]
      jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate').mockReturnValue(dateItems)

      const isSensitiveItems = [{ text: 'Yes', value: 'yes' as YesOrNo, checked: true }]
      const notesItems = {
        notes,
        isSensitiveItems,
        showIsSensitiveQuestion: true,
        isSensitiveValue: undefined as YesOrNo,
      }
      jest.spyOn(NotesUtils, 'questionItems').mockReturnValue(notesItems)

      const body = {
        'date-day': '25',
        'date-month': '06',
        'date-year': '2026',
        hours: '1',
        minutes: '20',
        notes,
        isSensitive: 'yes',
      }
      const request = createMock<Request>({
        params: { id: '1' },
        query: { form: formId },
        body,
      })

      const requestHandler = outcomeController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        ...notesItems,
        timeToCredit: { hours: body.hours, minutes: body.minutes },
        errorSummary,
        errors,
        dateItems,
        courseDetailsItems,
        requirementDetailsItems,
        courseCompletion,
        completionDetailsRows: mockCompletionDetailsRow,
      })
      expect(GovukFrontendDateInput.getDateItemsFromStructuredDate).toHaveBeenLastCalledWith(
        {
          day: '25',
          month: '06',
          year: '2026',
        },
        true,
      )
      expect(NotesUtils.questionItems).toHaveBeenCalledWith(body, form, undefined)
    })
  })
})
