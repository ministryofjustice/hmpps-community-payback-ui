import { AppointmentSummaryDto, ProjectDto } from '../@types/shared'
import Offender from '../models/offender'
import DateTimeFormats from '../utils/dateTimeUtils'
import LocationUtils from '../utils/locationUtils'
import SessionUtils from '../utils/sessionUtils'

interface ProjectViewData {
  name: string
  address: string
  primaryContact: {
    name: string
    email: string
    phone: string
  }
}

export default class ProjectPage {
  static appointmentList(appointments: Array<AppointmentSummaryDto>, projectCode: string) {
    return appointments.map(appointment => {
      const offender = new Offender(appointment.offender)
      return [
        { html: offender.getTableHtml() },
        {
          text: DateTimeFormats.isoDateToUIDate(appointment.date, { format: 'medium' }),
          attributes: {
            'data-sort-value': DateTimeFormats.isoToMilliseconds(appointment.date),
          },
        },
        {
          text: DateTimeFormats.stripTime(appointment.startTime),
        },
        {
          text: DateTimeFormats.stripTime(appointment.endTime),
        },
        { text: appointment.daysOverdue },
        SessionUtils.getAppointmentActionCell(appointment.id, projectCode, offender),
      ]
    })
  }

  static projectDetails(project: ProjectDto): ProjectViewData {
    return {
      name: project.projectName,
      address: LocationUtils.locationToString(project.location, { withLineBreaks: false }),
      primaryContact: {
        name: project.beneficiaryDetails.contactName,
        email: project.beneficiaryDetails.emailAddress,
        phone: project.beneficiaryDetails.telephoneNumber,
      },
    }
  }
}
