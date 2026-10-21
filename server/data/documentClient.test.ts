import nock from 'nock'
import { Readable } from 'stream'
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

  describe('deleteDocument', () => {
    it('should make a DELETE request to the appointment document path', async () => {
      nock(config.apis.communityPaybackApi.url)
        .delete(paths.appointments.document({ deliusAppointmentId: '1001', documentId: '1' }))
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(204)

      await documentClient.deleteDocument({ username: 'some-user-name', deliusAppointmentId: '1001', documentId: '1' })

      expect(nock.isDone()).toBe(true)
    })
  })

  describe('downloadDocument', () => {
    const readAll = async (stream: Readable): Promise<Buffer> => {
      const chunks: Array<Buffer> = []
      for await (const chunk of stream) {
        chunks.push(chunk)
      }
      return Buffer.concat(chunks)
    }

    const path = paths.appointments.document({ deliusAppointmentId: '1001', documentId: '1' })

    it('should stream the document content and return its headers', async () => {
      const content = Buffer.from([0, 1, 127, 128, 255])

      nock(config.apis.communityPaybackApi.url)
        .get(path)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, content, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="file.pdf"',
          'Content-Length': content.length.toString(),
        })

      const result = await documentClient.downloadDocument({
        username: 'some-user-name',
        deliusAppointmentId: '1001',
        documentId: '1',
      })

      expect(result.contentType).toEqual('application/pdf')
      expect(result.contentDisposition).toEqual('attachment; filename="file.pdf"')
      expect(result.contentLength).toEqual(content.length.toString())
      expect(await readAll(result.stream)).toEqual(content)
    })

    it('should reject with the status when the API responds with an error', async () => {
      nock(config.apis.communityPaybackApi.url).get(path).reply(404, { status: 404 })

      await expect(
        documentClient.downloadDocument({ username: 'some-user-name', deliusAppointmentId: '1001', documentId: '1' }),
      ).rejects.toMatchObject({ status: 404 })
    })

    it('should reject when the request fails before a response is received', async () => {
      nock(config.apis.communityPaybackApi.url).get(path).replyWithError('connection refused')

      await expect(
        documentClient.downloadDocument({ username: 'some-user-name', deliusAppointmentId: '1001', documentId: '1' }),
      ).rejects.toThrow('connection refused')
    })
  })
})
