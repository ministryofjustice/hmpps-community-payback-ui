import { EteCourseCompletionEventDto } from '../@types/shared'
import DateTimeFormats from './dateTimeUtils'

export interface LearnerDetails {
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  region: string
  pdu: string
  office: string
}

export interface CourseDetails {
  courseName: string
  courseType: string
  provider: string
  expectedTime: string
  expectedTimeWithAllowance: string
}

export default class CourseCompletionUtils {
  static formattedLearnerDetails(courseCompletion: EteCourseCompletionEventDto): LearnerDetails {
    return {
      firstName: courseCompletion.firstName,
      lastName: courseCompletion.lastName,
      dateOfBirth: DateTimeFormats.isoDateToUIDate(courseCompletion.dateOfBirth),
      email: courseCompletion.email,
      region: courseCompletion.region,
      pdu: courseCompletion.pdu.name,
      office: courseCompletion.office,
    }
  }

  static formattedCourseDetails(courseCompletion: EteCourseCompletionEventDto): CourseDetails {
    const expectedTime = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(
      courseCompletion.expectedTimeMinutes,
    )
    const expectedTimeWithAllowance = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(
      Math.round(courseCompletion.expectedTimeMinutes * 1.2),
    )

    return {
      courseName: courseCompletion.courseName,
      courseType: courseCompletion.courseType,
      provider: courseCompletion.provider,
      expectedTime,
      expectedTimeWithAllowance,
    }
  }
}
