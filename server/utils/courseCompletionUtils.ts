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
}
