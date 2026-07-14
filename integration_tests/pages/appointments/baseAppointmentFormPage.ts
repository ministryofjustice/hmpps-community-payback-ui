import Offender from '../../../server/models/offender'
import Page from '../page'
import { AppointmentFormPage, newAppointmentId } from '../../../server/pages/appointments/pathMap'
import { pathWithQuery } from '../../../server/utils/utils'
import paths from '../../../server/paths'
import { AppointmentDto, OffenderDto, SessionDto } from '../../../server/@types/shared'
import SelectedPeopleCardComponent from './selectedPeopleCardComponent'

export type AppointmentTitleContext = OffenderDto | Pick<SessionDto, 'projectName'>

export default abstract class BaseAppointmentFormPage extends Page {
  readonly selectedPeopleCard = new SelectedPeopleCardComponent()

  protected abstract page: AppointmentFormPage

  constructor(context: AppointmentTitleContext) {
    const title = 'crn' in context ? new Offender(context).name : context.projectName
    super(title)
  }

  static visit<T extends BaseAppointmentFormPage, A extends unknown[]>(
    this: new (offender: OffenderDto, ...args: A) => T,
    appointment: AppointmentDto,
    ...args: A
  ): T {
    const page = new this(appointment.offender, ...args)
    cy.visit(page.appointmentPath(appointment))
    page.checkOnPage()
    return page
  }

  static visitForSession<T extends BaseAppointmentFormPage, A extends unknown[]>(
    this: new (session: Pick<SessionDto, 'projectName'>, ...args: A) => T,
    session: SessionDto,
    ...args: A
  ): T {
    const page = new this({ projectName: session.projectName }, ...args)
    cy.visit(page.sessionPath(session))
    page.checkOnPage()
    return page
  }

  static visitForCreateAppointment<T extends BaseAppointmentFormPage, A extends unknown[]>(
    this: new (offender: OffenderDto, ...args: A) => T,
    projectCode: string,
    offender: OffenderDto,
    ...args: A
  ): T {
    const page = new this(offender, ...args)
    cy.visit(page.createAppointmentPath(projectCode))
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

  protected createAppointmentPath = (projectCode: string) =>
    pathWithQuery(
      paths.appointments.update({
        projectCode,
        appointmentId: newAppointmentId,
        page: this.page,
      }),
      { form: '123' },
    )
}
