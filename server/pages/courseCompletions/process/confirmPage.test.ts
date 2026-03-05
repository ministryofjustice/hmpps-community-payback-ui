import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
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
      const result = page.nextPath(id)
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
  })
})
