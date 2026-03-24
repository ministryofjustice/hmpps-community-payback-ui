import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import RequirementPage from './requirementPage'
import pathMap from './pathMap'
import { pathWithQuery } from '../../../utils/utils'
import caseDetailsSummaryFactory from '../../../testutils/factories/caseDetailsSummaryFactory'
import unpaidWorkDetailsFactory from '../../../testutils/factories/unpaidWorkDetailsFactory'
import * as ErrorUtils from '../../../utils/errorUtils'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'

describe('RequirementPage', () => {
  const pageName = 'requirement'
  const nextPath = pathMap[pageName].next
  const backPath = pathMap[pageName].back
  let page: RequirementPage
  beforeEach(() => {
    page = new RequirementPage()
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

  describe('getUnpaidWorkOptions', () => {
    it('returns an array of options', () => {
      const upwDetails = unpaidWorkDetailsFactory.build({
        sentenceDate: '2020-03-15',
        requiredMinutes: 240,
        completedEteMinutes: 100,
        remainingEteMinutes: 140,
        upwStatus: 'Being worked',
      })
      const { unpaidWorkDetails } = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [upwDetails] })

      const [result] = page.getUnpaidWorkOptions(unpaidWorkDetails)

      expect(result.text).toEqual(upwDetails.mainOffence.description)
      expect(result.value).toEqual(upwDetails.eventNumber)
      expect(result.hint.html).toEqual(
        `Event number: ${upwDetails.eventNumber}<br>Sentence date: 15 March 2020<br>Total hours ordered: 4 hours<br>ETE hours credited: 1 hour 40 minutes<br>ETE hours remaining: 2 hours 20 minutes<br>Status: Being worked`,
      )
    })

    it('returns an array of options with selected value', () => {
      const upwDetails = unpaidWorkDetailsFactory.build()
      const { unpaidWorkDetails } = caseDetailsSummaryFactory.build({ unpaidWorkDetails: [upwDetails] })

      const [result] = page.getUnpaidWorkOptions(unpaidWorkDetails, upwDetails.eventNumber)

      expect(result.checked).toBe(true)
    })
  })

  describe('validationErrors', () => {
    it('should return validation errors if no delius event number is present', () => {
      const errorSummary = [
        { text: 'Error 1', href: '#1', attributes: {} },
        { text: 'Error 2', href: '#2', attributes: { 'some-attr': 'value' } },
      ]

      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue(errorSummary)

      const expectedErrors = {
        deliusEventNumber: { text: 'Select a requirement' },
      }

      const result = page.validationErrors({})

      expect(result.hasErrors).toBe(true)
      expect(result.errors).toEqual(expectedErrors)

      expect(result.errorSummary).toEqual(errorSummary)
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith(expectedErrors)
    })

    it('has no errors if delius event number is provided', () => {
      jest.spyOn(ErrorUtils, 'generateErrorSummary').mockReturnValue([])
      const result = page.validationErrors({ deliusEventNumber: '1' })

      expect(result.hasErrors).toBe(false)
      expect(result.errors).toEqual({})
      expect(result.errorSummary).toEqual([])
      expect(ErrorUtils.generateErrorSummary).toHaveBeenCalledWith({})
    })
  })

  describe('formData', () => {
    it('should return a copy of the form data with delius event number', () => {
      const form = courseCompletionFormFactory.build()
      const body = { deliusEventNumber: '1' }

      const result = page.getFormData(form, body)
      expect(result).toEqual({ ...form, deliusEventNumber: 1 })
    })
  })
})
