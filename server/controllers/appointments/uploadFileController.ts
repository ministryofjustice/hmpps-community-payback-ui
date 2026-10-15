import type { Request, RequestHandler, Response } from 'express'
import AppointmentService from '../../services/appointmentService'
import DocumentService from '../../services/documentService'
import Offender from '../../models/offender'
import paths from '../../paths'
import { AppointmentDto } from '../../@types/shared'
import { catchApiValidationErrorOrPropagate, generateErrorSummary } from '../../utils/errorUtils'
import { ALLOWED_UPLOAD_FILE_EXTENSIONS, MAX_UPLOAD_FILE_SIZE_MB } from '../../middleware/setUpMultipartParsing'
import { pathWithOriginalPath } from '../../utils/utils'

const upperCaseExtensions = ALLOWED_UPLOAD_FILE_EXTENSIONS.map(extension => extension.toUpperCase())
const allowedExtensionsText = `${upperCaseExtensions.slice(0, -1).join(', ')} or ${upperCaseExtensions.at(-1)}`

export default class UploadFileController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly documentService: DocumentService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const appointment = await this.getAppointment(req, res)

      return res.render('appointments/uploadFile', this.viewData(req, appointment))
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { appointmentId } = req.params
      const appointment = await this.getAppointment(req, res)

      const errorText = this.validationError(req)

      if (errorText) {
        const errors = { file: { text: errorText } }

        return res.render('appointments/uploadFile', {
          ...this.viewData(req, appointment),
          errors,
          errorSummary: generateErrorSummary(errors),
        })
      }

      try {
        await this.documentService.uploadDocument(appointmentId, req.file, res.locals.user.username)

        req.flash('success', 'File uploaded')

        return res.redirect(this.appointmentDetailsPath(req))
      } catch (error) {
        return catchApiValidationErrorOrPropagate(req, res, error, this.uploadPath(req))
      }
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

  private validationError(req: Request): string | undefined {
    if (req.fileUploadError === 'FILE_TOO_LARGE') {
      return `The selected file must be smaller than ${MAX_UPLOAD_FILE_SIZE_MB}MB`
    }

    if (req.fileUploadError === 'FILE_TYPE_NOT_ALLOWED') {
      return `The selected file must be a ${allowedExtensionsText}`
    }

    if (!req.file) {
      return 'Select a file'
    }

    if (req.file.size === 0) {
      return 'The selected file is empty'
    }

    return undefined
  }

  private viewData(req: Request, appointment: AppointmentDto) {
    const offender = new Offender(appointment.offender)

    return {
      heading: { title: offender.name, caption: offender.crn },
      backLink: this.appointmentDetailsPath(req),
      updatePath: this.uploadPath(req),
      accept: ALLOWED_UPLOAD_FILE_EXTENSIONS.map(extension => `.${extension}`).join(','),
      preventDoubleClick: true,
    }
  }

  private appointmentDetailsPath(req: Request): string {
    const { projectCode, appointmentId } = req.params

    return pathWithOriginalPath(
      paths.appointments.details({ projectCode, appointmentId }),
      req.query.originalPath?.toString(),
    )
  }

  private uploadPath(req: Request): string {
    const { projectCode, appointmentId } = req.params

    return pathWithOriginalPath(
      paths.appointments.uploadFile({ projectCode, appointmentId }),
      req.query.originalPath?.toString(),
    )
  }
}
