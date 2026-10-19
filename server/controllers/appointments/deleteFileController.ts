import type { Request, RequestHandler, Response } from 'express'
import { NotFound } from 'http-errors'
import AppointmentService from '../../services/appointmentService'
import DocumentService from '../../services/documentService'
import Offender from '../../models/offender'
import paths from '../../paths'
import { AppointmentDto } from '../../@types/shared'
import { pathWithOriginalPath } from '../../utils/utils'

export default class DeleteFileController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly documentService: DocumentService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { appointmentId, documentId } = req.params

      const [appointment, documents] = await Promise.all([
        this.getAppointment(req, res),
        this.appointmentService.getDocuments(appointmentId, res.locals.user.username),
      ])

      const document = documents.find(({ documentId: id }) => id.toString() === documentId)

      if (!document) {
        throw new NotFound()
      }

      const offender = new Offender(appointment.offender)
      const appointmentDetailsPath = this.appointmentDetailsPath(req)

      return res.render('appointments/deleteFile', {
        heading: { title: offender.name, caption: offender.crn },
        filename: document.filename,
        backLink: appointmentDetailsPath,
        cancelLink: appointmentDetailsPath,
        updatePath: this.deletePath(req),
        preventDoubleClick: true,
      })
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { appointmentId, documentId } = req.params

      await this.getAppointment(req, res)
      await this.documentService.deleteDocument(appointmentId, documentId, res.locals.user.username)

      req.flash('success', 'File deleted')

      return res.redirect(this.appointmentDetailsPath(req))
    }
  }

  private async getAppointment(req: Request, res: Response): Promise<AppointmentDto> {
    const { projectCode, appointmentId } = req.params

    const appointment = await this.appointmentService.getAppointment({
      projectCode,
      appointmentId,
      username: res.locals.user.username,
    })

    res.locals.audit = {
      subjectType: 'CRN',
      subjectId: appointment.offender.crn,
    }

    return appointment
  }

  private appointmentDetailsPath(req: Request): string {
    const { projectCode, appointmentId } = req.params

    return pathWithOriginalPath(
      paths.appointments.details({ projectCode, appointmentId }),
      req.query.originalPath?.toString(),
    )
  }

  private deletePath(req: Request): string {
    const { projectCode, appointmentId, documentId } = req.params

    return pathWithOriginalPath(
      paths.appointments.deleteFile({ projectCode, appointmentId, documentId }),
      req.query.originalPath?.toString(),
    )
  }
}
