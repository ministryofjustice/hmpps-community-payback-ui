import type { Request, RequestHandler, Response } from 'express'
import { pipeline } from 'stream/promises'
import AppointmentService from '../../services/appointmentService'
import DocumentService from '../../services/documentService'
import logger from '../../../logger'

export default class DownloadFileController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly documentService: DocumentService,
  ) {}

  download(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { projectCode, appointmentId, documentId } = req.params
      const { username } = res.locals.user

      const appointment = await this.appointmentService.getAppointment({ projectCode, appointmentId, username })

      res.locals.audit = {
        subjectType: 'CRN',
        subjectId: appointment.offender.crn,
      }

      const { stream, contentType, contentDisposition, contentLength } = await this.documentService.downloadDocument(
        appointmentId,
        documentId,
        username,
      )

      res.setHeader('Content-Type', contentType ?? 'application/octet-stream')
      res.setHeader('Content-Disposition', contentDisposition ?? 'attachment')
      if (contentLength) {
        res.setHeader('Content-Length', contentLength)
      }

      try {
        await pipeline(stream, res)
      } catch (error) {
        if (!res.headersSent) {
          throw error
        }
        logger.error(`Error streaming document ${documentId} for appointment ${appointmentId}`, error)
      }
    }
  }
}
