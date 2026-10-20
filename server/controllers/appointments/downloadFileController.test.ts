import { createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { NotFound } from 'http-errors'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import DownloadFileController from './downloadFileController'
import AppointmentService from '../../services/appointmentService'
import DocumentService from '../../services/documentService'
import appointmentFactory from '../../testutils/factories/appointmentFactory'

jest.mock('stream/promises')

describe('DownloadFileController', () => {
  const username = 'user'
  const projectCode = 'ABC'
  const appointmentId = '2500789874'
  const documentId = '42'
  const params = { projectCode, appointmentId, documentId }

  const appointmentService = createMock<AppointmentService>()
  const documentService = createMock<DocumentService>()

  const appointment = appointmentFactory.build({ projectCode, id: Number(appointmentId) })
  const stream = Readable.from(['some file contents'])

  const next = createMock<NextFunction>({})
  const request = { params, query: {} } as unknown as Request

  let response: Response
  let controller: DownloadFileController

  beforeEach(() => {
    jest.resetAllMocks()
    response = createMock<Response>({ locals: { user: { username } }, headersSent: false })
    appointmentService.getAppointment.mockResolvedValue(appointment)
    documentService.downloadDocument.mockResolvedValue({
      stream,
      contentType: 'application/pdf',
      contentDisposition: 'attachment; filename="file.pdf"',
      contentLength: '18',
    })

    controller = new DownloadFileController(appointmentService, documentService)
  })

  it('streams the document to the response with its headers', async () => {
    await controller.download()(request, response, next)

    expect(appointmentService.getAppointment).toHaveBeenCalledWith({ projectCode, appointmentId, username })
    expect(documentService.downloadDocument).toHaveBeenCalledWith(appointmentId, documentId, username)
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf')
    expect(response.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="file.pdf"')
    expect(response.setHeader).toHaveBeenCalledWith('Content-Length', '18')
    expect(pipeline).toHaveBeenCalledWith(stream, response)
    expect(response.locals.audit).toEqual({ subjectType: 'CRN', subjectId: appointment.offender.crn })
  })

  it('defaults the content type and disposition and omits the length when not provided', async () => {
    documentService.downloadDocument.mockResolvedValue({ stream })

    await controller.download()(request, response, next)

    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream')
    expect(response.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment')
    expect(response.setHeader).not.toHaveBeenCalledWith('Content-Length', expect.anything())
  })

  it('propagates errors getting the document', async () => {
    const error = new NotFound()
    documentService.downloadDocument.mockRejectedValue(error)

    await expect(controller.download()(request, response, next)).rejects.toBe(error)
    expect(pipeline).not.toHaveBeenCalled()
  })

  it('propagates streaming errors before any content has been sent', async () => {
    const error = new Error('stream failed')
    jest.mocked(pipeline).mockRejectedValue(error)

    await expect(controller.download()(request, response, next)).rejects.toBe(error)
  })

  it('does not propagate streaming errors once content has been sent', async () => {
    response = createMock<Response>({ locals: { user: { username } }, headersSent: true })
    jest.mocked(pipeline).mockRejectedValue(new Error('stream failed'))

    await expect(controller.download()(request, response, next)).resolves.toBeUndefined()
  })
})
