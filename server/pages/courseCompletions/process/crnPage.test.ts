import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CrnPage, { CrnPageBody } from './crnPage'
import pathMap from './pathMap'
import * as ErrorUtils from '../../../utils/errorUtils'
import { pathWithQuery } from '../../../utils/utils'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import { CourseCompletionPageInput } from '../../courseCompletionIndexPage'

describe('CrnPage', () => {
  const pageName = 'crn'
  const nextPath = pathMap[pageName].next
  let page: CrnPage
  beforeEach(() => {
    jest.resetAllMocks()
    page = new CrnPage()
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
        backLink: paths.courseCompletions.show({ id: courseCompletion.id }),
        updatePath: paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }),
        courseName: courseCompletion.courseName,
      })
    })

    it('includes paths with form id if provided', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const form = '23'

      const result = page.viewData(courseCompletion, form)

      expect(result.backLink).toEqual(paths.courseCompletions.show({ id: courseCompletion.id }))

      expect(result.updatePath).toEqual(
        pathWithQuery(paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }), { form }),
      )
    })
  })

  describe('validationErrors', () => {
    it('should return validation errors if no crn', () => {
      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]

      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

      const expectedErrors = {
        crn: { text: 'Enter a CRN' },
      }

      const result = page.validationErrors({})

      expect(result.hasErrors).toBe(true)
      expect(result.errors).toEqual(expectedErrors)

      expect(result.errorSummary).toEqual(errorSummary)
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith(expectedErrors)
    })

    it('has no errors if region and team are provided', () => {
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue([])
      const result = page.validationErrors({ crn: '1' })

      expect(result.hasErrors).toBe(false)
      expect(result.errors).toEqual({})
      expect(result.errorSummary).toEqual([])
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith({})
    })
  })

  describe('formData', () => {
    it('returns copy of form data with provided crn', () => {
      const form = courseCompletionFormFactory.build()
      const crn = '1'

      const result = page.getFormData(form, { crn })
      expect(result).toEqual({ ...form, crn })
    })
  })

  describe('stepViewData', () => {
    const course = courseCompletionFactory.build()

    it('returns formatted view data', () => {
      const hintText = `Enter ${course.firstName} ${course.lastName}'s CRN to link the Community Campus account with nDelius.`

      const result = page.stepViewData(course, undefined, undefined)
      expect(result).toEqual({
        crn: undefined,
        hintText,
      })
    })

    describe('crn', () => {
      it.each(['', '1'])('includes the entered CRN if body has value', (crn: string) => {
        const form = courseCompletionFormFactory.build()
        const result = page.stepViewData(course, { crn }, form)
        expect(result.crn).toEqual(crn)
      })

      it.each([{}, undefined])('includes the form CRN if body has no crn value', (body?: CrnPageBody) => {
        const form = courseCompletionFormFactory.build()
        const result = page.stepViewData(course, body, form)
        expect(result.crn).toEqual(form.crn)
      })

      it('is undefined if body and form are undefined', () => {
        const result = page.stepViewData(course, undefined, undefined)
        expect(result.crn).toEqual(undefined)
      })

      it('is undefined if body and form crn value are undefined', () => {
        const form = courseCompletionFormFactory.build({ crn: undefined })
        const result = page.stepViewData(course, {}, form)
        expect(result.crn).toEqual(undefined)
      })
    })
  })

  describe('updatePath', () => {
    const courseCompletionId = '1'
    const formId = '23'

    it.each([undefined, {}])(
      'returns path with formId when originalSearch is undefined or empty',
      (originalSearch?: CourseCompletionPageInput) => {
        const expectedPath = pathWithQuery(paths.courseCompletions.process({ id: courseCompletionId, page: 'crn' }), {
          form: formId,
        })
        const result = page.updatePath({ courseCompletionId, formId, originalSearch })

        expect(result).toBe(expectedPath)
      },
    )

    it.each([undefined, {}])(
      'returns path when originalSearch is an empty object',
      (originalSearch?: CourseCompletionPageInput) => {
        const result = page.updatePath({ courseCompletionId, originalSearch })

        expect(result).toBe(paths.courseCompletions.process({ id: courseCompletionId, page: 'crn' }))
      },
    )

    it('returns path with query parameters when originalSearch has properties', () => {
      const originalSearch = { provider: 'london', pdu: 'team-a' }
      const expectedPath = pathWithQuery(paths.courseCompletions.process({ id: courseCompletionId, page: 'crn' }), {
        ...originalSearch,
        formId,
      })

      const result = page.updatePath({ courseCompletionId, formId, originalSearch })

      expect(result).toBe(expectedPath)
    })
  })

  describe('backPath', () => {
    it.each([undefined, {}])(
      'returns path when originalSearch is an empty object',
      (originalSearch?: CourseCompletionPageInput) => {
        const courseCompletion = courseCompletionFactory.build()
        const result = page.viewData(courseCompletion, '2', originalSearch).backLink

        expect(result).toBe(paths.courseCompletions.show({ id: courseCompletion.id }))
      },
    )

    it('returns path with query parameters when originalSearch has properties', () => {
      const courseCompletion = courseCompletionFactory.build()

      const originalSearch = { provider: 'london', pdu: 'team-a' }
      const expectedPath = pathWithQuery(paths.courseCompletions.show({ id: courseCompletion.id }), originalSearch)

      const result = page.viewData(courseCompletion, '2', originalSearch).backLink

      expect(result).toBe(expectedPath)
    })
  })
})
