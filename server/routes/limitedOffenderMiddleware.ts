import { NextFunction, Request, Response } from 'express'
import OffenderService from '../services/offenderService'
import Offender from '../models/offender'
import { AppointmentParams } from '../@types/user-defined'
import AppointmentService from '../services/appointmentService'

export default function limitedOffenderMiddleware({
  offenderService,
  backPath,
  appointmentService,
  crn: givenCrn,
  anotherPersonLink,
}: {
  offenderService: OffenderService
  backPath: string
  appointmentService?: AppointmentService
  crn?: string
  anotherPersonLink?: () => Promise<string>
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let crn = givenCrn || req.params.crn
    const { appointmentId } = req.params

    if (appointmentId && !crn) {
      const appointmentParams = req.params as unknown as AppointmentParams
      const appointment = await appointmentService.getAppointment({
        ...appointmentParams,
        username: res.locals.user.username,
      })

      crn = appointment.offender.crn
    }

    if (!crn) {
      return next()
    }

    const { offender } = await offenderService.getOffenderSummary({
      username: res.locals.user.username,
      crn,
    })

    const person = new Offender(offender)

    if (person.isLimited) {
      return res.render('pages/restrictedPerson', {
        person,
        backLink: backPath,
        ...(anotherPersonLink && { anotherPersonLink: await anotherPersonLink() }),
      })
    }

    return next()
  }
}
