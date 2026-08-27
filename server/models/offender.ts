import { AppointmentSummaryDto, OffenderDto, OffenderFullDto } from '../@types/shared'
import paths from '../paths'
import HtmlUtils from '../utils/htmlUtils'

export interface OffenderDetails {
  firstName?: string
  lastName?: string
  crn: string
  dateOfBirth?: string
  description: string
  descriptionWithLastNameFirst?: string
}

export default class Offender {
  readonly name: string

  readonly isLimited: boolean

  readonly crn: string

  readonly details: OffenderDetails

  constructor(offender: OffenderDto) {
    this.isLimited = offender.objectType !== 'Full'
    this.crn = offender.crn
    this.details = this.getOffenderDetails(offender)
    this.name = this.getName()
  }

  private getName(): string {
    if (this.isLimited) {
      return ''
    }

    return `${this.details.firstName} ${this.details.lastName}`
  }

  private getOffenderDetails(offender: OffenderDto) {
    if (this.isLimited) {
      return {
        crn: this.crn,
        description: this.crn,
      }
    }

    const fullOffender = offender as OffenderFullDto

    return {
      crn: this.crn,
      firstName: fullOffender.forename,
      lastName: fullOffender.surname,
      dateOfBirth: fullOffender.dateOfBirth,
      description: `${fullOffender.forename} ${fullOffender.surname} (${fullOffender.crn})`,
      descriptionWithLastNameFirst: `${fullOffender.surname}, ${fullOffender.forename} (${fullOffender.crn})`,
    }
  }

  getTableHtml(appointment: AppointmentSummaryDto): string {
    if (this.isLimited) {
      return this.crn
    }

    const nameAsStrong = HtmlUtils.getElementWithContent(this.getNameFormattedWithLastNameFirst(), 'strong')
    const link = HtmlUtils.getAnchor(nameAsStrong, this.viewPath(appointment))

    return `${link}<br />${this.crn}`
  }

  getNameFormattedWithLastNameFirst(): string {
    if (this.isLimited) {
      return this.name
    }

    return `${this.details.lastName}, ${this.details.firstName}`
  }

  viewPath(appointment: AppointmentSummaryDto) {
    return paths.people.appointmentsWithoutEvent({
      crn: this.crn,
      projectCode: appointment.projectCode,
      appointmentId: appointment.id.toString(),
    })
  }
}
