import { faker } from '@faker-js/faker'
import { createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import { pathWithQuery } from '../../../utils/utils'
import UnableToCreditTimePage from './unableToCreditTimePage'
import * as ErrorUtils from '../../../utils/errorUtils'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import { CourseCompletionPageInput } from '../../courseCompletionIndexPage'

describe('UnableToCreditTimePage', () => {
  let page: UnableToCreditTimePage

  beforeEach(() => {
    page = new UnableToCreditTimePage()
  })

  describe('getFormData', () => {
    it('should return a copy of the form data with unableToCreditTimeNotes', () => {
      const form = courseCompletionFormFactory.build()
      const body = { unableToCreditTimeNotes: 'notes' }

      const result = page.getFormData(form, body)
      expect(result).toEqual({ ...form, unableToCreditTimeNotes: 'notes' })
    })
  })

  describe('requestBody', () => {
    it('returns the request body', () => {
      const form = courseCompletionFormFactory.build({ unableToCreditTimeNotes: 'notes' })

      const result = page.requestBody(form)
      expect(result).toEqual({
        type: 'DONT_CREDIT_TIME',
        crn: form.crn,
        dontCreditTimeDetails: {
          notes: form.unableToCreditTimeNotes,
        },
      })
    })
  })

  describe('viewData', () => {
    it('returns view data for unable to credit time', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const expectedPerson = 'Mary Smith'

      const result = page.viewData(courseCompletion)

      expect(result).toEqual({
        communityCampusPerson: { name: expectedPerson },
        backLink: paths.courseCompletions.show({ id: courseCompletion.id }),
        updatePath: paths.courseCompletions.unableToCreditTime({ id: courseCompletion.id }),
        courseName: courseCompletion.courseName,
        unableToCreditTimePath: pathWithQuery(paths.courseCompletions.unableToCreditTime({ id: courseCompletion.id }), {
          backPage: 'unableToCreditTime',
        }),
      })
    })

    it('includes paths with form id if provided', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const form = '23'

      const result = page.viewData(courseCompletion, form)

      expect(result.backLink).toEqual(paths.courseCompletions.show({ id: courseCompletion.id }))

      expect(result.updatePath).toEqual(
        pathWithQuery(paths.courseCompletions.unableToCreditTime({ id: courseCompletion.id }), { form }),
      )
    })

    it('includes back page in backLink and update paths with form id if provided', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const form = '23'
      const request = createMock<Request>({
        query: {
          backPage: 'crn',
        },
      })

      const result = page.viewData(courseCompletion, form, undefined, request)

      expect(result.backLink).toEqual(
        pathWithQuery(paths.courseCompletions.process({ page: 'crn', id: courseCompletion.id }), { form }),
      )

      expect(result.updatePath).toEqual(
        pathWithQuery(paths.courseCompletions.unableToCreditTime({ id: courseCompletion.id }), {
          form,
          backPage: 'crn',
        }),
      )
    })

    it('includes original search in backLink and update paths with form id if provided', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const form = '23'
      const originalSearch: CourseCompletionPageInput = {
        pdu: 'pdu',
        provider: 'provider',
      }
      const request = createMock<Request>({
        query: {
          backPage: 'crn',
        },
      })

      const result = page.viewData(courseCompletion, form, originalSearch, request)

      expect(result.backLink).toEqual(
        pathWithQuery(paths.courseCompletions.process({ page: 'crn', id: courseCompletion.id }), {
          form,
          ...originalSearch,
        }),
      )

      expect(result.updatePath).toEqual(
        pathWithQuery(paths.courseCompletions.unableToCreditTime({ id: courseCompletion.id }), {
          form,
          backPage: 'crn',
          ...originalSearch,
        }),
      )
    })
  })

  describe('validationErrors', () => {
    it('should return validation errors if unable to credit time notes is more than 250 characters', () => {
      const notes = faker.string.alpha(251)

      const expectedErrors = {
        unableToCreditTimeNotes: { text: 'Notes must be 250 characters or less' },
      }

      const result = page.validationErrors({ unableToCreditTimeNotes: notes })

      expect(result.hasErrors).toBe(true)
      expect(result.errors).toEqual(expectedErrors)
    })

    it('has no errors if unableToCreditTimeNotes are not provided', () => {
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue([])
      const result = page.validationErrors({ unableToCreditTimeNotes: undefined })

      expect(result.hasErrors).toBe(false)
      expect(result.errors).toEqual({})
      expect(result.errorSummary).toEqual([])
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith({})
    })
  })
})
