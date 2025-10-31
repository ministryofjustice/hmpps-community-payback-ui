import nock from 'nock'
import { AuthenticationClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import AppointmentClient from './appointmentClient'
import paths from '../paths/api'
import appointmentFactory from '../testutils/factories/appointmentFactory'
import updateAppointmentOutcomeFactory from '../testutils/factories/updateAppointmentOutcomeFactory'

describe('appointmentClient', () => {
  let appointmentClient: AppointmentClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    appointmentClient = new AppointmentClient(mockAuthenticationClient)
  })

  describe('find', () => {
    it('should make a GET request to the appointments path using user token and return the response body', async () => {
      const appointment = appointmentFactory.build()

      nock(config.apis.communityPaybackApi.url)
        .get(paths.appointments.singleAppointment({ appointmentId: '1001' }))
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, appointment)

      const response = await appointmentClient.find('some-user-name', '1001')

      expect(response).toEqual(appointment)
    })
  })

  describe('save', () => {
    it('should make a POST request to the appointment outcomes path using user token', async () => {
      const appointmentData = updateAppointmentOutcomeFactory.build({ deliusId: 1001 })

      nock(config.apis.communityPaybackApi.url)
        .post(paths.appointments.outcome({ appointmentId: '1001' }))
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200)

      const response = await appointmentClient.save('some-user-name', appointmentData)

      expect(response).toBeTruthy()
    })
  })
})
