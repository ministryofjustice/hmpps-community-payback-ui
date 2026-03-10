import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import CrnPage from './crnPage'
import pathMap from './pathMap'
import * as ErrorUtils from '../../../utils/errorUtils'

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
      const result = page.nextPath(id)
      expect(result).toBe(paths.courseCompletions.process({ page: nextPath, id }))
    })
  })

  describe('viewData', () => {
    it('returns view data for appointments', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const expectedPerson = 'Mary Smith'

      const result = page.viewData(courseCompletion)

      expect(result).toEqual({
        offender: { name: expectedPerson },
        backLink: paths.courseCompletions.show({ id: courseCompletion.id }),
        updatePath: paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }),
      })
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
        crn: { text: 'Enter a crn' },
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
})
