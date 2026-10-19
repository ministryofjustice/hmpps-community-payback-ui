import { AgentConfig, asSystem, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import paths from '../paths/api'
import { DocumentUploadResponseDto } from '../@types/shared'
import { UploadedFile } from '../@types/user-defined'

// Uploads can be up to 100MB, so allow longer than the default API timeouts
const UPLOAD_TIMEOUT_MS = 120000

export default class DocumentClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super(
      'documentClient',
      {
        ...config.apis.communityPaybackApi,
        timeout: { response: UPLOAD_TIMEOUT_MS, deadline: UPLOAD_TIMEOUT_MS },
        agent: new AgentConfig(UPLOAD_TIMEOUT_MS),
      },
      logger,
      authenticationClient,
    )
  }

  uploadDocument({
    username,
    deliusAppointmentId,
    file,
  }: {
    username: string
    deliusAppointmentId: string
    file: UploadedFile
  }): Promise<DocumentUploadResponseDto> {
    const path = paths.appointments.documents({ deliusAppointmentId })

    return this.post({ path, files: { file } }, asSystem(username))
  }

  deleteDocument({
    username,
    deliusAppointmentId,
    documentId,
  }: {
    username: string
    deliusAppointmentId: string
    documentId: string
  }): Promise<void> {
    const path = paths.appointments.document({ deliusAppointmentId, documentId })

    return this.delete({ path }, asSystem(username))
  }
}
