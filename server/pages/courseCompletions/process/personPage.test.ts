import paths from '../../../paths'
import courseCompletionFactory from '../../../testutils/factories/courseCompletionFactory'
import PersonPage from './personPage'
import pathMap from './pathMap'
import { pathWithQuery } from '../../../utils/utils'
import CourseCompletionUtils from '../../../utils/courseCompletionUtils'
import offenderFullFactory from '../../../testutils/factories/offenderFullFactory'

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
        unableToCreditTimePath: pathWithQuery(paths.courseCompletions.unableToCreditTime({ id: courseCompletion.id }), {
          backPage: 'person',
        }),
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
    const courseCompletion = courseCompletionFactory.build()
    const offender = offenderFullFactory.build()
    const form = '12'

    it('returns formatted view data', () => {
      const learnerDetails = {
        firstName: 'Mary',
        lastName: 'Smith',
        dateOfBirth: '12 January 1990',
        email: 'example@email.com',
        region: 'Greater Manchester',
        pdu: 'Central',
        office: 'Chester St',
      }
      const offenderDetails = {
        firstName: 'Mary',
        lastName: 'Smith',
        dateOfBirth: '12 January 1990',
        crn: 'X000000',
        isLimited: false,
      }
      jest.spyOn(CourseCompletionUtils, 'formattedLearnerDetails').mockReturnValue(learnerDetails)
      jest.spyOn(CourseCompletionUtils, 'formattedOffenderDetails').mockReturnValue(offenderDetails)

      const result = page.stepViewData({ courseCompletion, offender, formId: form })
      expect(result).toEqual({
        learnerDetails,
        offenderDetails,
        crnPagePath: pathWithQuery(paths.courseCompletions.process({ page: backPath, id: courseCompletion.id }), {
          form,
        }),
      })
    })
  })
})
