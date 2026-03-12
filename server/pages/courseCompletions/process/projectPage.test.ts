import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import ProjectPage from './projectPage'
import pathMap from './pathMap'
import { pathWithQuery } from '../../../utils/utils'

describe('ProjectPage', () => {
  const pageName = 'project'
  const nextPath = pathMap[pageName].next
  const backPath = pathMap[pageName].back
  let page: ProjectPage
  beforeEach(() => {
    page = new ProjectPage()
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
})
