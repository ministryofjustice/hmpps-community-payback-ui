import { EteCourseCompletionEventDto } from '../@types/shared'
import paths from '../paths'
import DateTimeFormats from './dateTimeUtils'
import HtmlUtils from './htmlUtils'

export default class CourseCompletionUtils {
  static courseCompletionTableRows(courseCompletions: Array<EteCourseCompletionEventDto>) {
    return courseCompletions.map(courseCompletion => {
      const showPath = CourseCompletionUtils.getCourseCompletionPath(courseCompletion)

      const actionContent = `View ${HtmlUtils.getHiddenText(`${courseCompletion.firstName} ${courseCompletion.lastName}`)}`
      const linkHtml = HtmlUtils.getAnchor(actionContent, showPath)

      return [
        { text: `${courseCompletion.firstName} ${courseCompletion.lastName}` },
        { text: courseCompletion.id },
        { text: courseCompletion.courseName },
        { text: DateTimeFormats.isoDateToUIDate(courseCompletion.completionDate, { format: 'medium' }) },
        { html: linkHtml },
      ]
    })
  }

  static getCourseCompletionPath(courseCompletion: EteCourseCompletionEventDto) {
    return `${paths.courseCompletions.show({ id: courseCompletion.id.toString() })}`
  }
}
