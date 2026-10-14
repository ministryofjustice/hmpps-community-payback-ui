import express, { Router } from 'express'
import multer from 'multer'
import paths from '../paths'
import featureFlagMiddleware from '../routes/featureFlagMiddleware'

export const MAX_UPLOAD_FILE_SIZE_MB = 100

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024, files: 1 },
}).single('file')

export default function setUpMultipartParsing(): Router {
  const router = express.Router()

  router.post(
    paths.appointments.uploadFile.pattern,
    featureFlagMiddleware('documentUploadEnabled'),
    (req, res, next) => {
      upload(req, res, error => {
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
          req.fileUploadError = 'FILE_TOO_LARGE'
          return next()
        }
        return next(error)
      })
    },
  )

  return router
}
