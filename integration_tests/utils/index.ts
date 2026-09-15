import { AppointmentDto, AppointmentSummaryDto } from '../../server/@types/shared'
import { GetAppointmentsRequest } from '../../server/data/appointmentClient'
import caseDetailsSummaryFactory from '../../server/testutils/factories/caseDetailsSummaryFactory'
import offenderFullFactory from '../../server/testutils/factories/offenderFullFactory'
import unpaidWorkDetailsFactory from '../../server/testutils/factories/unpaidWorkDetailsFactory'
import DateTimeFormats from '../../server/utils/dateTimeUtils'

export default class Utils {
  static sortByDate = (a: AppointmentSummaryDto, b: AppointmentSummaryDto) => {
    const dateA = DateTimeFormats.isoToMilliseconds(a.date)
    const dateB = DateTimeFormats.isoToMilliseconds(b.date)
    return dateA - dateB
  }

  static stubOffenderFromAppointment(appointment: AppointmentDto) {
    const { crn } = appointment.offender
    const offender = offenderFullFactory.build({ crn })
    const upwDetails = unpaidWorkDetailsFactory.build()
    const caseDetailsSummary = caseDetailsSummaryFactory.build({
      offender,
      unpaidWorkDetails: [upwDetails, unpaidWorkDetailsFactory.build()],
    })

    cy.task('stubGetOffenderSummary', {
      caseDetailsSummary,
    })

    return offender
  }

  static getEteAppointmentRequest = (crn: string | undefined): GetAppointmentsRequest => ({
    projectTypeGroup: 'ETE',
    outcomeCodes: ['ATTC'],
    toDate: DateTimeFormats.dateObjToIsoString(new Date()),
    fromDate: DateTimeFormats.getTodaysDatePlusDays(-365).formattedDate,
    crn,
    sort: ['date,desc'],
  })
}
