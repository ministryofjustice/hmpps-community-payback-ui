import { DocumentUploadResponseDto } from '../@types/shared'
import { DocumentDownload, UploadedFile } from '../@types/user-defined'
import DocumentClient from '../data/documentClient'

export default class DocumentService {
  constructor(private readonly documentClient: DocumentClient) {}

  uploadDocument(appointmentId: string, file: UploadedFile, username: string): Promise<DocumentUploadResponseDto> {
    return this.documentClient.uploadDocument({ username, deliusAppointmentId: appointmentId, file })
  }

  deleteDocument(appointmentId: string, documentId: string, username: string): Promise<void> {
    return this.documentClient.deleteDocument({ username, deliusAppointmentId: appointmentId, documentId })
  }

  downloadDocument(appointmentId: string, documentId: string, username: string): Promise<DocumentDownload> {
    return this.documentClient.downloadDocument({ username, deliusAppointmentId: appointmentId, documentId })
  }
}
