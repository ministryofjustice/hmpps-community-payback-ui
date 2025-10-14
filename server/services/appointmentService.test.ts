import AppointmentClient from '../data/appointmentClient'
import appointmentFactory from '../testutils/factories/appointmentFactory'
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

    const result = await appointmentService.getAppointment('1001', 'some-username')

    expect(appointmentClient.find).toHaveBeenCalledTimes(1)
    expect(result).toEqual(appointment)
  })
})
