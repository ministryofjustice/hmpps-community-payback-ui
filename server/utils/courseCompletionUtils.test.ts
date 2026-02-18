import paths from '../paths'
import DateTimeFormats from './dateTimeUtils'
import HtmlUtils from './htmlUtils'
import CourseCompletionUtils from './courseCompletionUtils'
import courseCompletionFactory from '../testutils/factories/courseCompletionFactory'

jest.mock('../models/offender')

describe('CourseCompletionUtils', () => {
  const fakeLink = '<a>link</a>'
  const mockHiddenText = '<span></span>'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('courseCompletionTableRows', () => {
    const fakeFormattedDate = '20 January 2026'

    beforeEach(() => {
      jest.spyOn(DateTimeFormats, 'isoDateToUIDate').mockReturnValue(fakeFormattedDate)
      jest.spyOn(HtmlUtils, 'getAnchor').mockReturnValue(fakeLink)
      jest.spyOn(HtmlUtils, 'getHiddenText').mockReturnValue(mockHiddenText)
      jest.spyOn(paths.courseCompletions, 'show')
    })

    it('returns course completion results formatted into expected table rows', () => {
      const courseCompletion = courseCompletionFactory.build()
      const courseCompletions = [courseCompletion]

      const result = CourseCompletionUtils.courseCompletionTableRows(courseCompletions)
      expect(HtmlUtils.getAnchor).toHaveBeenCalledWith(
        `View ${mockHiddenText}`,
        `/course-completions/${courseCompletions[0].id}`,
      )

      expect(result).toEqual([
        [
          { text: `${courseCompletion.firstName} ${courseCompletion.lastName}` },
          { text: courseCompletion.id },
          { text: courseCompletion.courseName },
          { text: fakeFormattedDate },
          { html: fakeLink },
        ],
      ])
    })
  })

  describe('getCourseCompletionPath', () => {
    it('returns expected path given an EteCourseCompletionEventDto', () => {
      const courseCompletion = courseCompletionFactory.build()
      jest.spyOn(paths.courseCompletions, 'show').mockReturnValue(`/course-completions/${courseCompletion.id}`)
      const path = CourseCompletionUtils.getCourseCompletionPath(courseCompletion)

      expect(paths.courseCompletions.show).toHaveBeenCalledWith({ id: courseCompletion.id })
      expect(path).toBe(`/course-completions/${courseCompletion.id}`)
    })
  })
})
