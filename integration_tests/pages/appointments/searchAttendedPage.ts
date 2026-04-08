import { AppointmentDto, AppointmentTaskSummaryDto } from '../../../server/@types/shared'
import { ProviderSummaryDto } from '../../../server/@types/shared/models/ProviderSummaryDto'
import Offender from '../../../server/models/offender'
import paths from '../../../server/paths'
import DateTimeFormats from '../../../server/utils/dateTimeUtils'
import HtmlUtils from '../../../server/utils/htmlUtils'
import DataTableComponent from '../components/datatableComponent'
import SelectInput from '../components/selectComponent'
import Page from '../page'

export default class SearchAttendedPage extends Page {
  appointments: Array<AppointmentTaskSummaryDto>

  regionSelect: SelectInput

  appointmentsTable: DataTableComponent

  constructor(appointments: Array<AppointmentTaskSummaryDto> = []) {
    super('Adjust travel time')
    this.appointments = appointments

    this.regionSelect = new SelectInput('provider')
    this.appointmentsTable = new DataTableComponent()
  }

  static visit(appointments: Array<AppointmentTaskSummaryDto> = []) {
    cy.visit(paths.appointments.travelTime.index({}))

    return new SearchAttendedPage(appointments)
  }

  shouldShowSearchForm() {
    cy.get('h2').contains('Filter appointments')
    cy.get('label').contains('Region')
  }

  selectRegion(provider: ProviderSummaryDto) {
    this.regionSelect.select(provider.code)
  }

  clickFilter() {
    this.clickSubmit('Apply filters')
  }

  shouldShowAttendedAppointments() {
    const expectedRowValues = this.appointments.map(row => {
      const { appointment } = row

      const link = HtmlUtils.getAnchor(
        'Update',
        paths.appointments.travelTime.update({
          appointmentId: appointment.id.toString(),
          projectCode: appointment.projectCode,
          taskId: row.taskId,
        }),
      )
      return [
        new Offender(appointment.offender).name,
        appointment.offender.crn,
        DateTimeFormats.isoDateToUIDate(appointment.date),
        link,
      ]
    })
    this.appointmentsTable.shouldHaveRowsWithContent(expectedRowValues)
  }

  shouldShowSuccessBanner(appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)
    const formattedDate = DateTimeFormats.isoDateToUIDate(appointment.date)
    this.shouldShowSuccessMessage(`${offender.name}'s appointment on ${formattedDate} has been adjusted`)
  }
}
