import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import PersonPage from './personPage'
import pathMap from './pathMap'

describe('PersonPage', () => {
  const pageName = 'person'
  const nextPath = pathMap[pageName].next
  const backPath = pathMap[pageName].back
  let page: PersonPage
  beforeEach(() => {
    page = new PersonPage()
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
        backLink: paths.courseCompletions.process({ page: backPath, id: courseCompletion.id }),
        updatePath: paths.courseCompletions.process({ page: pageName, id: courseCompletion.id }),
      })
    })
  })
})
