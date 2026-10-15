import express from 'express'
import request from 'supertest'
import setUpMultipartParsing, { MAX_UPLOAD_FILE_SIZE_MB } from './setUpMultipartParsing'
import paths from '../paths'
import config from '../config'

describe('setUpMultipartParsing', () => {
  beforeEach(() => {
    jest.replaceProperty(config, 'featureFlags', { ...config.featureFlags, documentUploadEnabled: true })
  })

  const uploadPath = paths.appointments.uploadFile({ projectCode: 'ABC', appointmentId: '123' })

  const app = express()
  app.use(setUpMultipartParsing())
  app.post('*path', (req, res) => {
    res.json({
      body: { ...req.body },
      file: req.file && { originalname: req.file.originalname, size: req.file.size },
      fileUploadError: req.fileUploadError,
    })
  })

  it('parses the multipart fields and file on the upload path', async () => {
    const response = await request(app)
      .post(uploadPath)
      .field('_csrf', 'some-token')
      .attach('file', Buffer.from('some file contents'), 'file.txt')

    expect(response.body).toEqual({
      body: { _csrf: 'some-token' },
      file: { originalname: 'file.txt', size: 18 },
    })
  })

  it.each(['file.PDF', 'file.docx', 'file.mp3'])('accepts an allowed file extension (%s)', async filename => {
    const response = await request(app).post(uploadPath).attach('file', Buffer.from('some file contents'), filename)

    expect(response.body.file).toEqual({ originalname: filename, size: 18 })
  })

  it.each(['file.exe', 'file', 'file.pdf.exe'])(
    'skips the file and flags the request when the extension is not allowed (%s)',
    async filename => {
      const response = await request(app)
        .post(uploadPath)
        .field('_csrf', 'some-token')
        .attach('file', Buffer.from('some file contents'), filename)

      expect(response.status).toEqual(200)
      expect(response.body).toEqual({ body: { _csrf: 'some-token' }, fileUploadError: 'FILE_TYPE_NOT_ALLOWED' })
    },
  )

  it('flags the request rather than erroring when the file is too large', async () => {
    const response = await request(app)
      .post(uploadPath)
      .field('_csrf', 'some-token')
      .attach('file', Buffer.alloc(MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024 + 1), 'large.txt')

    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ body: { _csrf: 'some-token' }, fileUploadError: 'FILE_TOO_LARGE' })
  })

  it('does not parse multipart bodies on other paths', async () => {
    const response = await request(app)
      .post('/some/other/path')
      .field('_csrf', 'some-token')
      .attach('file', Buffer.from('some file contents'), 'file.txt')

    expect(response.body).toEqual({ body: {} })
  })

  it('redirects without reading the upload when the document upload feature is disabled', async () => {
    jest.replaceProperty(config, 'featureFlags', { ...config.featureFlags, documentUploadEnabled: false })

    const response = await request(app).post(uploadPath).attach('file', Buffer.from('some file contents'), 'file.txt')

    expect(response.status).toEqual(302)
    expect(response.headers.location).toEqual('/')
  })
})
