import type { Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import SessionService from '../../services/sessionService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import sessionFactory from '../../testutils/factories/sessionFactory'
import getAppointmentOrSession from './getAppointmentOrSession'

describe('getAppointmentOrSession', () => {
  it('calls appointment service with request params and username and returns appointment', async () => {
    const appointment = appointmentFactory.build()
    const appointmentService = { getAppointment: jest.fn(() => appointment) } as unknown as AppointmentService
    const sessionService = { getSession: jest.fn() } as unknown as SessionService

    const appointmentOrSessionParams = {
      appointmentId: '123',
      projectCode: 'XRC',
    }

    const res = {
      locals: {
        user: {
          username: 'username',
        },
      },
    } as Response

    const result = await getAppointmentOrSession({
      appointmentOrSessionParams,
      res,
      appointmentService,
      sessionService,
    })

    expect(result).toEqual(appointment)
    expect(appointmentService.getAppointment).toHaveBeenCalledWith({
      appointmentId: '123',
      projectCode: 'XRC',
      username: 'username',
    })
  })

  it('calls session service with project code, date and username and returns session', async () => {
    const session = sessionFactory.build()
    const appointmentService = { getAppointment: jest.fn() } as unknown as AppointmentService
    const sessionService = { getSession: jest.fn(() => session) } as unknown as SessionService

    const appointmentOrSessionParams = {
      projectCode: 'XRC',
      date: '2026-06-10',
    }

    const res = {
      locals: {
        user: {
          username: 'username',
        },
      },
    } as Response

    const result = await getAppointmentOrSession({
      appointmentOrSessionParams,
      res,
      appointmentService,
      sessionService,
    })

    expect(result).toEqual(session)
    expect(sessionService.getSession).toHaveBeenCalledWith({
      username: 'username',
      projectCode: 'XRC',
      date: '2026-06-10',
    })
    expect(appointmentService.getAppointment).not.toHaveBeenCalled()
  })

  it('throws if neither date nor appointmentId are provided', async () => {
    const appointmentService = { getAppointment: jest.fn() } as unknown as AppointmentService
    const sessionService = { getSession: jest.fn() } as unknown as SessionService

    const appointmentOrSessionParams = {
      projectCode: 'XRC',
    }

    const res = {
      locals: {
        user: {
          username: 'username',
        },
      },
    } as Response

    await expect(
      getAppointmentOrSession({
        appointmentOrSessionParams,
        res,
        appointmentService,
        sessionService,
      }),
    ).rejects.toThrow('Either appointmentId or date must be provided')
  })
})
