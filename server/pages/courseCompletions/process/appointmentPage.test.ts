import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import { pathWithQuery } from '../../../utils/utils'
import AppointmentPage from './appointmentPage'
import pathMap from './pathMap'
import * as ErrorUtils from '../../../utils/errorUtils'
import pagedModelAppointmentSummaryFactory from '../../../testutils/factories/pagedModelAppointmentSummaryFactory'
import appointmentSummaryFactory from '../../../testutils/factories/appointmentSummaryFactory'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'

describe('AppointmentPage', () => {
  const pageName = 'appointments'
  const nextPath = pathMap[pageName].next
  const backPath = pathMap[pageName].back
  let page: AppointmentPage
  beforeEach(() => {
    page = new AppointmentPage()
  })

  describe('nextPath', () => {
    it('returns the next page path', () => {
      const id = '1'
      const result = page.nextPath(id, undefined)
      expect(result).toBe(paths.courseCompletions.process({ page: nextPath, id }))
    })

    it('includes form parameter if provided', () => {
      const id = '1'
      const form = '23'
      const result = page.nextPath(id, form)
      expect(result).toBe(pathWithQuery(paths.courseCompletions.process({ page: nextPath, id }), { form }))
    })
  })

  describe('viewData', () => {
    it('returns view data for appointments', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const expectedPerson = 'Mary Smith'

      const result = page.viewData(courseCompletion)

      expect(result).toEqual({
        communityCampusPerson: { name: expectedPerson },
        backLink: paths.courseCompletions.process({ page: backPath, id: courseCompletion.id }),
        updatePath: paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }),
        courseName: courseCompletion.courseName,
      })
    })

    it('includes paths with form id if provided', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const form = '23'

      const result = page.viewData(courseCompletion, form)

      expect(result.backLink).toEqual(
        pathWithQuery(paths.courseCompletions.process({ page: backPath, id: courseCompletion.id }), { form }),
      )

      expect(result.updatePath).toEqual(
        pathWithQuery(paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }), { form }),
      )
    })
  })

  describe('validationErrors', () => {
    it('should return validation errors if no appointment ID is present', () => {
      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]

      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

      const expectedErrors = {
        appointmentId: { text: 'Select an appointment or create a new one' },
      }

      const result = page.validationErrors({})

      expect(result.hasErrors).toBe(true)
      expect(result.errors).toEqual(expectedErrors)

      expect(result.errorSummary).toEqual(errorSummary)
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith(expectedErrors)
    })

    it('has no errors if appointment ID is provided', () => {
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue([])
      const result = page.validationErrors({ appointmentId: 1 })

      expect(result.hasErrors).toBe(false)
      expect(result.errors).toEqual({})
      expect(result.errorSummary).toEqual([])
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith({})
    })
  })

  describe('getAppointmentOptions', () => {
    it('returns an array of options', () => {
      const notes = 'first note --------------------------------------------------------- second note'
      const appointmentSummary = appointmentSummaryFactory.build({ date: '2026-04-28', notes })
      const pagedModelAppointmentSummaries = pagedModelAppointmentSummaryFactory.build({
        content: [appointmentSummary],
      })

      const [result] = page.getAppointmentOptions(pagedModelAppointmentSummaries)

      expect(result.text).toEqual('28 April 2026')
      expect(result.value).toEqual(appointmentSummary.id)
      expect(result.hint.html).toEqual(
        `Project type: ${appointmentSummary.projectTypeName}<br>Project: ${appointmentSummary.projectName}<br>Notes: first note --------------------------------------------------------- second note`,
      )
    })

    it('returns an array of options without notes', () => {
      const appointmentSummary = appointmentSummaryFactory.build({ date: '2026-04-28', notes: undefined })
      const pagedModelAppointmentSummaries = pagedModelAppointmentSummaryFactory.build({
        content: [appointmentSummary],
      })

      const [result] = page.getAppointmentOptions(pagedModelAppointmentSummaries)

      expect(result.text).toEqual('28 April 2026')
      expect(result.value).toEqual(appointmentSummary.id)
      expect(result.hint.html).toEqual(
        `Project type: ${appointmentSummary.projectTypeName}<br>Project: ${appointmentSummary.projectName}`,
      )
    })

    it('returns an array of options with selected value', () => {
      const appointmentSummary = appointmentSummaryFactory.build()
      const pagedModelAppointmentSummaries = pagedModelAppointmentSummaryFactory.build({
        content: [appointmentSummary],
      })

      const [result] = page.getAppointmentOptions(pagedModelAppointmentSummaries, appointmentSummary.id)

      expect(result.checked).toBe(true)
    })
  })

  describe('formData', () => {
    describe('when appointmentId is present', () => {
      it('should return a copy of the form data with appointmentId', () => {
        const form = courseCompletionFormFactory.build()
        const body = { appointmentId: 1 }

        const result = page.getFormData(form, body)
        expect(result).toEqual({ ...form, appointmentIdToUpdate: 1 })
      })
    })

    describe('when appointmentId is not present', () => {
      it('should return a copy of the form data with undefined values', () => {
        const form = courseCompletionFormFactory.build()
        const body = {}

        const result = page.getFormData(form, body)
        expect(result).toEqual({
          ...form,
          appointmentIdToUpdate: undefined,
          notes: undefined,
          timeToCredit: undefined,
          'date-day': undefined,
          'date-year': undefined,
          'date-month': undefined,
          isSensitive: undefined,
        })
      })
    })
  })
})
