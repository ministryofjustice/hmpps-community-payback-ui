import { AppointmentSummaryDto } from '../../../server/@types/shared'
import Offender from '../../../server/models/offender'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import SummaryListComponent from '../components/summaryListComponent'

export default class SelectedPeopleCardComponent {
  private readonly card = new SummaryListComponent('Selected people')

  clickChangeLink() {
    this.card.getAction('Change').click()
  }

  shouldShowSelectedPeople(expectedAppointmentSummaries: Array<AppointmentSummaryDto>) {
    expectedAppointmentSummaries.forEach(appointment => {
      const offender = new Offender(appointment.offender)
      this.card
        .getValueWithLabel(`${offender.name} (${offender.crn})`)
        .should('contain.text', `${DateTimeFormats.timePeriod(appointment.startTime, appointment.endTime)}`)
    })
  }

  shouldNotShowPeople(appointments: Array<AppointmentSummaryDto>) {
    appointments.forEach(appointment => {
      const offender = new Offender(appointment.offender)
      this.card.shouldNotContainRowWithLabel(`${offender.name} (${offender.crn})`)
    })
  }
}
