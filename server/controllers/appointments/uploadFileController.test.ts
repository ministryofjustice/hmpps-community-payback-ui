import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import UploadFileController from './uploadFileController'
import AppointmentService from '../../services/appointmentService'
import DocumentService from '../../services/documentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import Offender from '../../models/offender'
import paths from '../../paths'
import * as ErrorUtils from '../../utils/errorUtils'
import { pathWithOriginalPath } from '../../utils/utils'

describe('UploadFileController', () => {
  const username = 'user'
  const projectCode = 'ABC'
  const appointmentId = '2500789874'
  const params = { projectCode, appointmentId }

  const appointmentService = createMock<AppointmentService>()
  const documentService = createMock<DocumentService>()

  const appointment = appointmentFactory.build({ projectCode, id: Number(appointmentId) })
  const offender = new Offender(appointment.offender)

  const next = createMock<NextFunction>({})

  const detailsPath = paths.appointments.details({ projectCode, appointmentId })
  const uploadPath = paths.appointments.uploadFile({ projectCode, appointmentId })

  const originalPath = '/sessions/ABC/2026-10-15?page=2'

  const expectedViewData = {
    heading: { title: offender.name, caption: offender.crn },
    backLink: detailsPath,
    updatePath: uploadPath,
    accept:
      '.doc,.docx,.rtf,.txt,.dot,.dotm,.docm,.odt,.xml,.wpd,.wri,.wps,.xls,.xlsb,.xlsx,.csv,.pdf,.bmp,.jpg,.jpeg,.gif,.png,.m4a,.flac,.mp3',
    preventDoubleClick: true,
  }

  const file = { buffer: Buffer.from('some file contents'), originalname: 'file.txt', size: 18 } as Express.Multer.File

  const buildRequest = (overrides: Partial<Request> = {}) =>
    ({ params, query: {}, flash: jest.fn(), ...overrides }) as unknown as Request

  let response: Response
  let controller: UploadFileController

  beforeEach(() => {
    jest.resetAllMocks()
    response = createMock<Response>({ locals: { user: { username } } })
    appointmentService.getAppointment.mockResolvedValue(appointment)

    controller = new UploadFileController(appointmentService, documentService)
  })

  describe('show', () => {
    it('renders the upload file page', async () => {
      const request = buildRequest()

      await controller.show()(request, response, next)

      expect(appointmentService.getAppointment).toHaveBeenCalledWith({ projectCode, appointmentId, username })
      expect(response.render).toHaveBeenCalledWith('appointments/uploadFile', expectedViewData)
      expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: appointment.offender.crn })
    })

    it('keeps the original path in the back link and form action when one is provided', async () => {
      const request = buildRequest({ query: { originalPath } })

      await controller.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('appointments/uploadFile', {
        ...expectedViewData,
        backLink: pathWithOriginalPath(detailsPath, originalPath),
        updatePath: pathWithOriginalPath(uploadPath, originalPath),
      })
    })
  })

  describe('submit', () => {
    it('uploads the file and redirects to the appointment details page with a success message', async () => {
      const request = buildRequest({ file })

      await controller.submit()(request, response, next)

      expect(documentService.uploadDocument).toHaveBeenCalledWith(appointmentId, file, username)
      expect(request.flash).toHaveBeenCalledWith('success', 'File uploaded')
      expect(response.redirect).toHaveBeenCalledWith(detailsPath)
      expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: appointment.offender.crn })
    })

    it('keeps the original path when redirecting to the appointment details page', async () => {
      const request = buildRequest({ file, query: { originalPath } })

      await controller.submit()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(pathWithOriginalPath(detailsPath, originalPath))
    })

    it.each([
      ['no file is selected', {}, 'Select a file'],
      ['the file is empty', { file: { ...file, size: 0 } }, 'The selected file is empty'],
      ['the file is too large', { fileUploadError: 'FILE_TOO_LARGE' }, 'The selected file must be smaller than 100MB'],
      [
        'the file type is not allowed',
        { fileUploadError: 'FILE_TYPE_NOT_ALLOWED' },
        'The selected file must be a DOC, DOCX, RTF, TXT, DOT, DOTM, DOCM, ODT, XML, WPD, WRI, WPS, XLS, XLSB, XLSX, CSV, PDF, BMP, JPG, JPEG, GIF, PNG, M4A, FLAC or MP3',
      ],
    ])('renders the page with an error when %s', async (_, overrides, errorText) => {
      const request = buildRequest(overrides as Partial<Request>)

      await controller.submit()(request, response, next)

      const errors = { file: { text: errorText } }

      expect(documentService.uploadDocument).not.toHaveBeenCalled()
      expect(response.render).toHaveBeenCalledWith('appointments/uploadFile', {
        ...expectedViewData,
        errors,
        errorSummary: ErrorUtils.generateErrorSummary(errors),
      })
    })

    it('calls catchApiValidationErrorOrPropagate when the upload fails', async () => {
      jest.spyOn(ErrorUtils, 'catchApiValidationErrorOrPropagate')
      const error: SanitisedError = {
        name: 'SanitisedError',
        message: 'API error',
        responseStatus: 400,
        data: {
          userMessage: 'Unsupported file extension',
          developerMessage: 'Developer message',
          status: 400,
        },
      }
      documentService.uploadDocument.mockRejectedValue(error)

      const request = buildRequest({ file })

      await controller.submit()(request, response, next)

      expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(request, response, error, uploadPath)
      expect(request.flash).toHaveBeenCalledWith('error', 'Unsupported file extension')
      expect(response.redirect).toHaveBeenCalledWith(uploadPath)
    })

    it('keeps the original path when redirecting back after an API error', async () => {
      jest.spyOn(ErrorUtils, 'catchApiValidationErrorOrPropagate')
      const error: SanitisedError = {
        name: 'SanitisedError',
        message: 'API error',
        responseStatus: 400,
        data: { userMessage: 'Unsupported document format', developerMessage: 'Developer message', status: 400 },
      }
      documentService.uploadDocument.mockRejectedValue(error)

      const request = buildRequest({ file, query: { originalPath } })

      await controller.submit()(request, response, next)

      expect(ErrorUtils.catchApiValidationErrorOrPropagate).toHaveBeenCalledWith(
        request,
        response,
        error,
        pathWithOriginalPath(uploadPath, originalPath),
      )
    })
  })
})
