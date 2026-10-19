import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { NotFound } from 'http-errors'
import DeleteFileController from './deleteFileController'
import AppointmentService from '../../services/appointmentService'
import DocumentService from '../../services/documentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'
import appointmentDocumentFactory from '../../testutils/factories/appointmentDocumentFactory'
import Offender from '../../models/offender'
import paths from '../../paths'
import { pathWithOriginalPath } from '../../utils/utils'

describe('DeleteFileController', () => {
  const username = 'user'
  const projectCode = 'ABC'
  const appointmentId = '2500789874'
  const document = appointmentDocumentFactory.build()
  const documentId = document.documentId.toString()
  const params = { projectCode, appointmentId, documentId }

  const appointmentService = createMock<AppointmentService>()
  const documentService = createMock<DocumentService>()

  const appointment = appointmentFactory.build({ projectCode, id: Number(appointmentId) })
  const offender = new Offender(appointment.offender)
  const documents = [appointmentDocumentFactory.build(), document]

  const next = createMock<NextFunction>({})

  const detailsPath = paths.appointments.details({ projectCode, appointmentId })
  const deletePath = paths.appointments.deleteFile({ projectCode, appointmentId, documentId })

  const originalPath = '/sessions/ABC/2026-10-15?page=2'

  const buildRequest = (overrides: Partial<Request> = {}) =>
    ({ params, query: {}, flash: jest.fn(), ...overrides }) as unknown as Request

  let response: Response
  let controller: DeleteFileController

  beforeEach(() => {
    jest.resetAllMocks()
    response = createMock<Response>({ locals: { user: { username } } })
    appointmentService.getAppointment.mockResolvedValue(appointment)
    appointmentService.getDocuments.mockResolvedValue(documents)

    controller = new DeleteFileController(appointmentService, documentService)
  })

  describe('show', () => {
    it('renders the delete file page for the document', async () => {
      const request = buildRequest()

      await controller.show()(request, response, next)

      expect(appointmentService.getAppointment).toHaveBeenCalledWith({ projectCode, appointmentId, username })
      expect(appointmentService.getDocuments).toHaveBeenCalledWith(appointmentId, username)
      expect(response.render).toHaveBeenCalledWith('appointments/deleteFile', {
        heading: { title: offender.name, caption: offender.crn },
        filename: document.filename,
        backLink: detailsPath,
        cancelLink: detailsPath,
        updatePath: deletePath,
        preventDoubleClick: true,
      })
      expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: appointment.offender.crn })
    })

    it('keeps the original path in the links and form action when one is provided', async () => {
      const request = buildRequest({ query: { originalPath } })

      await controller.show()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'appointments/deleteFile',
        expect.objectContaining({
          backLink: pathWithOriginalPath(detailsPath, originalPath),
          cancelLink: pathWithOriginalPath(detailsPath, originalPath),
          updatePath: pathWithOriginalPath(deletePath, originalPath),
        }),
      )
    })

    it('throws a not found error if the document does not belong to the appointment', async () => {
      appointmentService.getDocuments.mockResolvedValue([appointmentDocumentFactory.build()])
      const request = buildRequest()

      await expect(controller.show()(request, response, next)).rejects.toThrow(NotFound)
      expect(response.render).not.toHaveBeenCalled()
    })
  })

  describe('submit', () => {
    it('deletes the document and redirects to the appointment details page with a success message', async () => {
      const request = buildRequest()

      await controller.submit()(request, response, next)

      expect(documentService.deleteDocument).toHaveBeenCalledWith(appointmentId, documentId, username)
      expect(request.flash).toHaveBeenCalledWith('success', 'File deleted')
      expect(response.redirect).toHaveBeenCalledWith(detailsPath)
      expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: appointment.offender.crn })
    })

    it('keeps the original path when redirecting', async () => {
      const request = buildRequest({ query: { originalPath } })

      await controller.submit()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(pathWithOriginalPath(detailsPath, originalPath))
    })
  })
})
