import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import courseCompletionFormFactory from '../../../testutils/factories/courseCompletionFormFactory'
import { pathWithQuery } from '../../../utils/utils'
import ConfirmPage from './confirmPage'
import pathMap from './pathMap'

describe('ConfirmPage', () => {
  const pageName = 'confirm'
  const backPath = pathMap[pageName].back
  let page: ConfirmPage
  beforeEach(() => {
    page = new ConfirmPage()
  })

  describe('nextPath', () => {
    it('returns the next page path', () => {
      const id = '1'
      const result = page.nextPath(id, undefined)
      expect(result).toBe(paths.courseCompletions.show({ id }))
    })
  })

  describe('viewData', () => {
    it('returns view data for appointments', () => {
      const courseCompletion = courseCompletionFactory.build({ firstName: 'Mary', lastName: 'Smith' })
      const expectedPerson = 'Mary Smith'

      const result = page.viewData(courseCompletion)

      expect(result).toEqual({
        offender: { name: expectedPerson },
        backLink: paths.courseCompletions.process({ page: backPath, id: courseCompletion.id }),
        updatePath: paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }),
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

  describe('stepViewData', () => {
    it('returns form items as GovUKsummary items', () => {
      const form = courseCompletionFormFactory.build()
      const formId = '12'
      const courseCompletionId = '23'

      const result = page.stepViewData(courseCompletionId, form, formId)
      const expectedItems = [
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: form.crn,
          },
          actions: {
            items: [
              {
                href: pathWithQuery(paths.courseCompletions.process({ page: 'crn', id: courseCompletionId }), {
                  form: formId,
                }),
                text: 'Change',
                visuallyHiddenText: 'crn',
              },
            ],
          },
        },
      ]
      expect(result).toEqual({ submittedItems: expectedItems })
    })

    it('returns form items as GovUKsummary empty items if form or formId are undefined', () => {
      const courseCompletionId = '23'

      const result = page.stepViewData(courseCompletionId, undefined, undefined)
      const expectedItems = [
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: undefined as string,
          },
          actions: {
            items: [
              {
                href: paths.courseCompletions.process({ page: 'crn', id: courseCompletionId }),
                text: 'Change',
                visuallyHiddenText: 'crn',
              },
            ],
          },
        },
      ]
      expect(result).toEqual({ submittedItems: expectedItems })
    })
  })
})
