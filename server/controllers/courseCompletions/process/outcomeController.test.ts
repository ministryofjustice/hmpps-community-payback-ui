import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import OutcomeController from './outcomeController'
import CourseCompletionService from '../../../services/courseCompletionService'
import OutcomePage from '../../../pages/courseCompletions/process/outcomePage'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CourseCompletionFormService from '../../../services/forms/courseCompletionFormService'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import GovukFrontendDateInput from '../../../forms/GovukFrontendDateInput'
import GovUkRadioGroup from '../../../forms/GovUkRadioGroup'
import CourseCompletionUtils from '../../../utils/courseCompletionUtils'
import OffenderService from '../../../services/offenderService'
import unpaidWorkDetailsFactory from '../../../testutils/factories/unpaidWorkDetailsFactory'
import offenderFullFactory from '../../../testutils/factories/offenderFullFactory'

describe('OutcomeController', () => {
  const username = 'username'
  const response = createMock<Response>({ locals: { user: { username } } })
  const next = createMock<NextFunction>({})

  const templatePath = '/views/page.njk'
  const courseCompletionService = createMock<CourseCompletionService>()
  const formService = createMock<CourseCompletionFormService>()
  const offenderService = createMock<OffenderService>()
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

  beforeEach(() => {
    jest.resetAllMocks()
    outcomeController = new OutcomeController(page, courseCompletionService, formService, offenderService)
    courseCompletionService.getCourseCompletion.mockResolvedValue(courseCompletion)
    formService.getForm.mockResolvedValue({})
    jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue([])
    jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate').mockReturnValue([])
    jest.spyOn(CourseCompletionUtils, 'formattedCourseDetails').mockReturnValue(courseDetailsItems)

    offenderService.getOffenderSummary.mockResolvedValue({
      unpaidWorkDetails,
      offender: offenderFullFactory.build(),
    })
    page.requirementDetailsItems.mockReturnValue(requirementDetailsItems)
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
        courseDetailsItems,
        requirementDetailsItems,
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
      const form = courseCompletionFormFactory.build({ timeToCredit })
      formService.getForm.mockResolvedValue(form)
      const dateItems = [
        { name: 'day', classes: '', value: '01' },
        { name: 'month', classes: '', value: '02' },
      ]
      jest.spyOn(GovukFrontendDateInput, 'getDateItemsFromStructuredDate').mockReturnValue(dateItems)
      const isSensitiveItems = [{ text: 'Yes', value: 'yes' }]
      jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue(isSensitiveItems)

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
        timeToCredit,
        dateItems,
        isSensitiveItems,
        notes: form.notes,
        courseDetailsItems,
        requirementDetailsItems,
      })

      expect(GovukFrontendDateInput.getDateItemsFromStructuredDate).toHaveBeenLastCalledWith(
        {
          day: form['date-day'],
          month: form['date-month'],
          year: form['date-year'],
        },
        false,
      )

      expect(GovUkRadioGroup.yesNoItems).toHaveBeenCalledWith({ checkedValue: form.isSensitive })
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
      formService.getForm.mockResolvedValue({ crn, deliusEventNumber })
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
      })
      expect(formService.getForm).toHaveBeenCalledTimes(1)
      expect(CourseCompletionUtils.formattedCourseDetails).toHaveBeenCalledWith(courseCompletion)

      expect(GovukFrontendDateInput.getDateItemsFromStructuredDate).toHaveBeenLastCalledWith({}, false)
      expect(GovUkRadioGroup.yesNoItems).toHaveBeenCalledWith({ checkedValue: undefined })
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
      const form = courseCompletionFormFactory.build({ timeToCredit })
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

      const isSensitiveItems = [{ text: 'Yes', value: 'yes' }]
      jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue(isSensitiveItems)

      const request = createMock<Request>({ params: { id: '1' }, query: { form: formId }, body: { team: teamCode } })

      const requestHandler = outcomeController.submit()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(templatePath, {
        ...viewData,
        errors,
        errorSummary,
        timeToCredit,
        dateItems,
        notes: form.notes,
        isSensitiveItems,
        courseDetailsItems,
        requirementDetailsItems,
      })

      expect(GovukFrontendDateInput.getDateItemsFromStructuredDate).toHaveBeenLastCalledWith(
        {
          day: form['date-day'],
          month: form['date-month'],
          year: form['date-year'],
        },
        true,
      )
      expect(GovUkRadioGroup.yesNoItems).toHaveBeenCalledWith({ checkedValue: form.isSensitive })
    })

    it('uses values from request body over form data', async () => {
      const form = courseCompletionFormFactory.build()
      formService.getForm.mockResolvedValue(form)
      const formId = '12'

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

      const isSensitiveItems = [{ text: 'Yes', value: 'yes' }]
      jest.spyOn(GovUkRadioGroup, 'yesNoItems').mockReturnValue(isSensitiveItems)

      const body = {
        'date-day': '25',
        'date-month': '06',
        'date-year': '2026',
        hours: '1',
        minutes: '20',
        notes: 'some note',
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
        timeToCredit: { hours: body.hours, minutes: body.minutes },
        errorSummary,
        errors,
        dateItems,
        isSensitiveItems,
        notes: body.notes,
        courseDetailsItems,
        requirementDetailsItems,
      })
      expect(GovukFrontendDateInput.getDateItemsFromStructuredDate).toHaveBeenLastCalledWith(
        {
          day: '25',
          month: '06',
          year: '2026',
        },
        true,
      )
      expect(GovUkRadioGroup.yesNoItems).toHaveBeenCalledWith({ checkedValue: body.isSensitive })
    })
  })
})
