import { Readable } from 'stream'
import DocumentClient from '../data/documentClient'
import DocumentService from './documentService'

jest.mock('../data/documentClient')

describe('DocumentService', () => {
  const documentClient = new DocumentClient(null) as jest.Mocked<DocumentClient>
  let documentService: DocumentService

  beforeEach(() => {
    jest.resetAllMocks()
    documentService = new DocumentService(documentClient)
  })

  describe('uploadDocument', () => {
    it('should call uploadDocument on the api client and return its result', async () => {
      const file = { buffer: Buffer.from('some file contents'), originalname: 'file.txt' }
      const response = { documentId: 1, filename: 'file.txt' }
      documentClient.uploadDocument.mockResolvedValue(response)

      const result = await documentService.uploadDocument('1001', file, 'some-username')

      expect(documentClient.uploadDocument).toHaveBeenCalledWith({
        username: 'some-username',
        deliusAppointmentId: '1001',
        file,
      })
      expect(result).toEqual(response)
    })
  })

  describe('deleteDocument', () => {
    it('should call deleteDocument on the api client', async () => {
      await documentService.deleteDocument('1001', '1', 'some-username')

      expect(documentClient.deleteDocument).toHaveBeenCalledWith({
        username: 'some-username',
        deliusAppointmentId: '1001',
        documentId: '1',
      })
    })
  })

  describe('downloadDocument', () => {
    it('should call downloadDocument on the api client and return its result', async () => {
      const download = { stream: Readable.from(['some file contents']), contentType: 'text/plain' }
      documentClient.downloadDocument.mockResolvedValue(download)

      const result = await documentService.downloadDocument('1001', '1', 'some-username')

      expect(documentClient.downloadDocument).toHaveBeenCalledWith({
        username: 'some-username',
        deliusAppointmentId: '1001',
        documentId: '1',
      })
      expect(result).toEqual(download)
    })
  })
})
