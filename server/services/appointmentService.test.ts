import AppointmentClient from '../data/appointmentClient'
import appointmentFactory from '../testutils/factories/appointmentFactory'
import updateAppointmentOutcomeFactory from '../testutils/factories/updateAppointmentOutcomeFactory'
import AppointmentService from './appointmentService'

jest.mock('../data/appointmentClient')

describe('AppointmentService', () => {
  const appointmentClient = new AppointmentClient(null) as jest.Mocked<AppointmentClient>
  let appointmentService: AppointmentService

  beforeEach(() => {
    appointmentService = new AppointmentService(appointmentClient)
  })

  it('should call getAppointment on the api client and return its result', async () => {
    const appointment = appointmentFactory.build()

    appointmentClient.find.mockResolvedValue(appointment)

    const result = await appointmentService.getAppointment({
      projectCode: appointment.projectCode,
      appointmentId: '1001',
      username: 'some-username',
    })

    expect(appointmentClient.find).toHaveBeenCalledTimes(1)
    expect(result).toEqual(appointment)
  })

  it('should call saveAppointment on the api client', async () => {
    const appointmentData = updateAppointmentOutcomeFactory.build()

    await appointmentService.saveAppointment(appointmentData, 'some-username')

    expect(appointmentClient.save).toHaveBeenCalledTimes(1)
  })
})
