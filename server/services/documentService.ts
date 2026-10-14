import { DocumentUploadResponseDto } from '../@types/shared'
import { UploadedFile } from '../@types/user-defined'
import DocumentClient from '../data/documentClient'

export default class DocumentService {
  constructor(private readonly documentClient: DocumentClient) {}

  uploadDocument(appointmentId: string, file: UploadedFile, username: string): Promise<DocumentUploadResponseDto> {
    return this.documentClient.uploadDocument({ username, deliusAppointmentId: appointmentId, file })
  }
}
