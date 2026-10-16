import nock from 'nock'
import { AuthenticationClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import DocumentClient from './documentClient'
import paths from '../paths/api'

describe('DocumentClient', () => {
  let documentClient: DocumentClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    documentClient = new DocumentClient(mockAuthenticationClient)
  })

  describe('uploadDocument', () => {
    it('should make a multipart POST request to the appointment documents path and return the response body', async () => {
      const response = { documentId: 1, filename: 'file.txt' }

      nock(config.apis.communityPaybackApi.url)
        .post(paths.appointments.documents({ deliusAppointmentId: '1001' }), body => {
          return /name="file"; filename="file.txt"/.test(body) && body.includes('some file contents')
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .matchHeader('content-type', /^multipart\/form-data/)
        .reply(200, response)

      const result = await documentClient.uploadDocument({
        username: 'some-user-name',
        deliusAppointmentId: '1001',
        file: { buffer: Buffer.from('some file contents'), originalname: 'file.txt' },
      })

      expect(result).toEqual(response)
    })
  })
})
