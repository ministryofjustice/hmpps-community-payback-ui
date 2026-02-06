import AppointmentClient from '../data/appointmentClient'
import appointmentFactory from '../testutils/factories/appointmentFactory'
import pagedModelAppointmentSummaryFactory from '../testutils/factories/pagedModelAppointmentSummaryFactory'
import updateAppointmentOutcomeFactory from '../testutils/factories/updateAppointmentOutcomeFactory'
import DateTimeFormats from '../utils/dateTimeUtils'
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

    await appointmentService.saveAppointment('1', appointmentData, 'some-username')

    expect(appointmentClient.save).toHaveBeenCalledTimes(1)
  })

  describe('getProjectAppointmentsWithMissingOutcomes', () => {
    it('should search with the given project code, NO_OUTCOME and toDate of today', async () => {
      const projectCode = '123'
      const username = 'some-username'

      const refDate = '2025-02-01'
      jest.spyOn(DateTimeFormats, 'dateObjToIsoString').mockReturnValue(refDate)

      const appointments = pagedModelAppointmentSummaryFactory.build()
      appointmentClient.getAppointments.mockResolvedValue(appointments)

      const result = await appointmentService.getProjectAppointmentsWithMissingOutcomes({ projectCode, username })
      expect(appointmentClient.getAppointments).toHaveBeenCalledWith(username, {
        projectCodes: [projectCode],
        outcomeCodes: ['NO_OUTCOME'],
        toDate: refDate,
      })

      expect(result).toEqual(appointments)
    })
  })
})
