import type { Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import SessionService from '../../services/sessionService'
import { AppointmentOrSession, AppointmentOrSessionParams } from '../../@types/user-defined'

type AppointmentFormDetailsParams = {
  appointmentOrSessionParams: AppointmentOrSessionParams
  res: Response
  appointmentService: AppointmentService
  sessionService: SessionService
}

export default async ({
  appointmentOrSessionParams,
  res,
  appointmentService,
  sessionService,
}: AppointmentFormDetailsParams): Promise<AppointmentOrSession> => {
  const { projectCode, date, appointmentId } = appointmentOrSessionParams
  const { username } = res.locals.user

  if (!appointmentId && !date) {
    throw new Error('Either appointmentId or date must be provided')
  }

  if (appointmentId) {
    const appointment = await appointmentService.getAppointment({
      projectCode,
      appointmentId,
      username,
    })
    return appointment
  }

  const session = await sessionService.getSession({
    username,
    projectCode,
    date,
  })

  return session
}
