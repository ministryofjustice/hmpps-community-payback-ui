import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import { pathWithQuery } from '../../../utils/utils'
import OutcomePage from './outcomePage'
import pathMap from './pathMap'
import * as Utils from '../../../utils/utils'
import GovukFrontendDateInput from '../../../forms/GovukFrontendDateInput'

describe('OutcomePage', () => {
  const pageName = 'outcome'
  const nextPath = pathMap[pageName].next
  const backPath = pathMap[pageName].back
  let page: OutcomePage
  beforeEach(() => {
    jest.resetAllMocks()
    page = new OutcomePage()
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

  describe('formData', () => {
    it('returns copy of form data with provided outcome', () => {
      const form = courseCompletionFormFactory.build()
      const timeToCredit = { hours: '1', minutes: '30' }
      const dateBody = { 'date-day': '01', 'date-month': '05', 'date-year': '2025' }
      const notes = 'Some note'
      const isSensitive = 'yes'

      const result = page.getFormData(form, { ...timeToCredit, ...dateBody, notes, isSensitive })
      expect(result).toEqual({ ...form, ...dateBody, timeToCredit, notes, isSensitive })
    })
  })

  describe('validationErrors', () => {
    it('returns no errors if valid body', () => {
      const result = page.validationErrors({
        hours: '2',
        minutes: '20',
        'date-day': '01',
        'date-month': '05',
        'date-year': '2025',
      })
      expect(result.errors).toEqual({})
      expect(result.hasErrors).toBe(false)
    })

    describe('hours and minutes', () => {
      it('should not return error for hours or minutes if hours is present', () => {
        const result = page.validationErrors({ hours: '2' }).errors
        expect(result.hours).toBeUndefined()
        expect(result.minutes).toBeUndefined()
      })

      it('should not return error for hours or minutes if minutes is present', () => {
        const result = page.validationErrors({ minutes: '2' }).errors
        expect(result.minutes).toBeUndefined()
        expect(result.hours).toBeUndefined()
      })

      it.each([undefined, ''])('should return an error if no hours or minutes', (value?: string) => {
        const result = page.validationErrors({ hours: value })
        expect(result.errors.hours).toEqual({ text: 'Enter hours and minutes for credited hours' })
        expect(result.hasErrors).toBe(true)
      })

      it('should return an error for invalid hours and minutes', () => {
        jest.spyOn(Utils, 'isWholePositiveNumber').mockReturnValue(false)
        const result = page.validationErrors({ hours: 'hello', minutes: 'world' })

        expect(result.errors.hours).toEqual({
          text: 'Enter valid hours for credited hours, for example 2',
        })
        expect(result.errors.minutes).toEqual({
          text: 'Enter valid minutes for credited hours, for example 30',
        })
        expect(result.hasErrors).toBe(true)
      })

      it('should not return an error for valid hours and minutes inputs', () => {
        jest.spyOn(Utils, 'isWholePositiveNumber').mockReturnValue(true)

        const result = page.validationErrors({ hours: '5', minutes: '40' })

        expect(result.errors.hours).toBeUndefined()
        expect(result.errors.minutes).toBeUndefined()
      })

      it('should return error if minutes is above 59', () => {
        jest.spyOn(Utils, 'isWholePositiveNumber').mockReturnValue(true)
        const result = page.validationErrors({ hours: '', minutes: '60' })

        expect(result.errors.minutes).toEqual({
          text: 'Enter valid minutes for credited hours, for example 30',
        })
        expect(result.hasErrors).toBe(true)
      })
    })

    describe('appointment date', () => {
      it('should return no errors if valid complete date', () => {
        jest.spyOn(GovukFrontendDateInput, 'dateIsComplete').mockReturnValue(true)
        jest.spyOn(GovukFrontendDateInput, 'dateIsValid').mockReturnValue(true)
        const result = page.validationErrors({
          'date-day': '15',
          'date-month': '03',
          'date-year': '2026',
        })

        expect(result.errors['date-day']).toBeUndefined()
      })

      it('should return error if date is incomplete', () => {
        jest.spyOn(GovukFrontendDateInput, 'dateIsComplete').mockReturnValue(false)
        const result = page.validationErrors({
          'date-day': '15',
          'date-month': '',
          'date-year': '2026',
        })

        expect(result.errors['date-day']).toEqual({
          text: 'Appointment date must include a day, month and year',
        })
        expect(result.hasErrors).toBe(true)
      })

      it('should return error if date is invalid', () => {
        jest.spyOn(GovukFrontendDateInput, 'dateIsComplete').mockReturnValue(true)
        jest.spyOn(GovukFrontendDateInput, 'dateIsValid').mockReturnValue(false)
        const result = page.validationErrors({
          'date-day': '31',
          'date-month': '02',
          'date-year': '2026',
          hours: '1',
          minutes: '30',
        })

        expect(result.errors['date-day']).toEqual({
          text: 'Appointment date must be a valid date',
        })
        expect(result.hasErrors).toBe(true)
      })
    })

    describe('notes', () => {
      it.each([undefined, ''])('should return no errors if notes is undefined or empty', (notes?: string) => {
        jest.spyOn(GovukFrontendDateInput, 'dateIsComplete').mockReturnValue(true)
        jest.spyOn(GovukFrontendDateInput, 'dateIsValid').mockReturnValue(true)
        const result = page.validationErrors({ notes })
        expect(result.errors.notes).toBeUndefined()
      })

      it.each([3999, 4000])('should return no errors if notes is %d characters', (notesCount: number) => {
        jest.spyOn(GovukFrontendDateInput, 'dateIsComplete').mockReturnValue(true)
        jest.spyOn(GovukFrontendDateInput, 'dateIsValid').mockReturnValue(true)
        const notes = 'a'.repeat(notesCount)
        const result = page.validationErrors({
          notes,
        })
        expect(result.errors.notes).toBeUndefined()
      })

      it('should return an error if notes exceeds 4000 characters', () => {
        jest.spyOn(GovukFrontendDateInput, 'dateIsComplete').mockReturnValue(true)
        jest.spyOn(GovukFrontendDateInput, 'dateIsValid').mockReturnValue(true)
        const notes = 'a'.repeat(4001)
        const result = page.validationErrors({
          hours: '2',
          minutes: '20',
          'date-day': '01',
          'date-month': '05',
          'date-year': '2025',
          notes,
        })
        expect(result.errors.notes).toEqual({
          text: 'Notes must be 4000 characters or less',
        })
        expect(result.hasErrors).toBe(true)
      })
    })
  })
})
