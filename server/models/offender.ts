import { OffenderDto, OffenderFullDto } from '../@types/shared'
import HtmlUtils from '../utils/htmlUtils'

export interface OffenderDetails {
  firstName?: string
  lastName?: string
  crn: string
  dateOfBirth?: string
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
      }
    }

    const fullOffender = offender as OffenderFullDto

    return {
      crn: this.crn,
      firstName: fullOffender.forename,
      lastName: fullOffender.surname,
      dateOfBirth: fullOffender.dateOfBirth,
    }
  }

  getTableHtml(): string {
    if (this.isLimited) {
      return this.crn
    }

    return `${HtmlUtils.getElementWithContent(this.name, 'strong')}<br />${this.crn}`
  }
}
