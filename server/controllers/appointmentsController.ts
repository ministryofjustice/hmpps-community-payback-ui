import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../services/appointmentService'
import Offender from '../models/offender'
import DateTimeFormats from '../utils/dateTimeUtils'
import ReferenceDataService from '../services/referenceDataService'
import paths from '../paths'
import SessionUtils from '../utils/sessionUtils'
import ProviderService from '../services/providerService'
import GovUkSelectInput from '../forms/GovUkSelectInput'

export default class AppointmentsController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly providerService: ProviderService,
  ) {}

  projectDetails(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)

      const supervisors = await this.providerService.getSupervisors({
        providerCode: appointment.providerCode,
        teamCode: appointment.supervisingTeamCode,
        username: res.locals.user.username,
      })

      const supervisorItems = GovUkSelectInput.getOptions(supervisors, 'name', 'id', 'Choose supervisor')
      const offender = new Offender(appointment.offender)

      const project = {
        name: appointment.projectName,
        type: appointment.projectTypeName,
        supervisingTeam: appointment.supervisingTeam,
        dateAndTime: DateTimeFormats.dateAndTimePeriod(appointment.date, appointment.startTime, appointment.endTime),
      }

      const backLink = SessionUtils.getSessionPath(appointment)

      res.render('appointments/update/projectDetails', {
        project,
        offender,
        supervisorItems,
        backLink,
        updatePath: paths.appointments.projectDetails({ appointmentId }),
      })
    }
  }

  updateProjectDetails(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params
      res.redirect(paths.appointments.attendanceOutcome({ appointmentId }))
    }
  }

  attendanceOutcome(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const { appointmentId } = _req.params

      const appointment = await this.appointmentService.getAppointment(appointmentId, res.locals.user.username)
      const outcomes = await this.referenceDataService.getContactOutcomes(res.locals.user.username)
      const offender = new Offender(appointment.offender)

      const outcomeItems = outcomes.contactOutcomes.map(outcome => ({ text: outcome.name, value: outcome.id }))

      res.render('appointments/update/attendanceOutcome', {
        offender,
        items: outcomeItems,
        updatePath: paths.appointments.update({ appointmentId }),
      })
    }
  }

  update(): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.redirect('/')
    }
  }
}
