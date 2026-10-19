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
})
