import { EteCourseCompletionEventDto, OffenderDto } from '../@types/shared'
import { GovUkSummaryListItem } from '../@types/user-defined'
import Offender, { OffenderDetails } from '../models/offender'
import DateTimeFormats from './dateTimeUtils'
import GovUKComponentUtils from './govUkComponentUtils'
import HtmlUtils from './htmlUtils'

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
  completionDate: string
  expectedTime: string
  expectedTimeWithAllowance: string
  totalTimeSpent: string
}

export type CourseCompletionOffenderDetails = OffenderDetails & { isLimited: boolean }

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

    const totalTimeSpent = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(courseCompletion.totalTimeMinutes)

    return {
      completionDate: DateTimeFormats.isoDateToUIDate(courseCompletion.completionDateTime),
      expectedTime,
      expectedTimeWithAllowance,
      totalTimeSpent,
    }
  }

  static formattedOffenderDetails(offender: OffenderDto): CourseCompletionOffenderDetails {
    const offenderData = new Offender(offender)

    if (offenderData.isLimited) {
      return {
        ...offenderData.details,
        isLimited: offenderData.isLimited,
      }
    }

    return {
      ...offenderData.details,
      dateOfBirth: DateTimeFormats.isoDateToUIDate(offenderData.details.dateOfBirth),
      isLimited: offenderData.isLimited,
    }
  }

  static formattedCourseCompletionLabel(label: string): string {
    return label === 'Passed' ? 'Pass' : 'Fail'
  }

  static completionDetailsRows({
    courseCompletion,
    allCourseCompletions,
  }: {
    courseCompletion: EteCourseCompletionEventDto
    allCourseCompletions: EteCourseCompletionEventDto[]
  }): GovUkSummaryListItem[] {
    const MAX_ATTEMPTS = 3

    const sortedCourseCompletions = [...allCourseCompletions].sort((a, b) =>
      b.completionDateTime.localeCompare(a.completionDateTime),
    )

    const maxAttemptNumber = courseCompletion.status === 'Passed' ? courseCompletion.attempts : MAX_ATTEMPTS

    const rows: GovUkSummaryListItem[] = []

    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      const rowLength = rows.length
      const currentCourseCompletion = sortedCourseCompletions[i]
      const shouldSkipBuildingRow =
        courseCompletion.status === 'Passed' && !currentCourseCompletion && courseCompletion.attempts === rowLength

      if (!shouldSkipBuildingRow) {
        const attemptNumber = maxAttemptNumber - rowLength

        const item = currentCourseCompletion
          ? this.buildCourseCompletionRow(currentCourseCompletion)
          : this.buildCourseCompletionRow(undefined, attemptNumber)

        rows.push(item)
      }
    }

    return rows
  }

  private static buildCourseCompletionRow(courseCompletion?: EteCourseCompletionEventDto, attempt?: number) {
    if (!courseCompletion) {
      const contentHtml = `
        <div class="govuk-!-padding-left-0 govuk-grid-column-two-thirds">
          Details in Community Campus
        </div>
        <div class="govuk-grid-column-one-third govuk-!-text-align-right">
          ${HtmlUtils.getStatusTag('Fail', 'red')}
        </div>
      `
      return GovUKComponentUtils.buildSummaryListItem({
        label: `Attempt ${attempt}`,
        content: contentHtml,
        contentIsHtml: true,
      })
    }

    const completionDate = DateTimeFormats.isoDateToUIDate(courseCompletion.completionDateTime)
    const timeSpent = DateTimeFormats.totalMinutesToHumanReadableHoursAndMinutes(courseCompletion.totalTimeMinutes)
    const status = CourseCompletionUtils.formattedCourseCompletionLabel(courseCompletion.status)
    const statusColour = courseCompletion.status === 'Passed' ? 'green' : 'red'

    const contentHtml = `
      <div class="govuk-!-padding-left-0 govuk-grid-column-one-quarter">
        ${completionDate}
      </div>
      <div class="govuk-!-padding-left-0 govuk-grid-column-one-half">
        Time spent: ${timeSpent}
      </div>
      <div class="govuk-grid-column-one-quarter govuk-!-text-align-right">
        ${HtmlUtils.getStatusTag(status, statusColour)}
      </div>
    `

    return GovUKComponentUtils.buildSummaryListItem({
      label: `Attempt ${courseCompletion.attempts}`,
      content: contentHtml,
      contentIsHtml: true,
    })
  }
}
