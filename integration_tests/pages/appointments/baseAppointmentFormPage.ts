import { AppointmentOrSession } from '../../../server/@types/user-defined'
import Offender from '../../../server/models/offender'
import Page from '../page'
import { AppointmentFormPage } from '../../../server/pages/appointments/pathMap'
import { pathWithQuery } from '../../../server/utils/utils'
import paths from '../../../server/paths'
import { AppointmentDto, SessionDto } from '../../../server/@types/shared'
import SelectedPeopleCardComponent from './selectedPeopleCardComponent'

export default abstract class BaseAppointmentFormPage extends Page {
  protected readonly isSingleAppointment: boolean

  readonly selectedPeopleCard = new SelectedPeopleCardComponent()

  protected abstract page: AppointmentFormPage

  constructor(appointment: AppointmentOrSession) {
    const isSingleAppointment = 'offender' in appointment
    const title = isSingleAppointment ? new Offender(appointment.offender).name : appointment.projectName
    super(title)
    this.isSingleAppointment = isSingleAppointment
  }

  static visit<T extends BaseAppointmentFormPage, A extends unknown[]>(
    this: new (appointment: AppointmentDto, ...args: A) => T,
    appointment: AppointmentDto,
    ...args: A
  ): T {
    const page = new this(appointment, ...args)
    cy.visit(page.appointmentPath(appointment))
    page.checkOnPage()
    return page
  }

  static visitForSession<T extends BaseAppointmentFormPage, A extends unknown[]>(
    this: new (session: SessionDto, ...args: A) => T,
    session: SessionDto,
    ...args: A
  ): T {
    const page = new this(session, ...args)
    cy.visit(page.sessionPath(session))
    page.checkOnPage()
    return page
  }

  protected appointmentPath = (appointment: AppointmentDto) =>
    pathWithQuery(
      paths.appointments.update({
        projectCode: appointment.projectCode,
        appointmentId: appointment.id.toString(),
        page: this.page,
      }),
      { form: '123' },
    )

  protected sessionPath = (session: SessionDto) =>
    pathWithQuery(
      paths.sessions.update({
        projectCode: session.projectCode,
        date: session.date,
        page: this.page,
      }),
      { form: '123' },
    )
}
