import type { Request, RequestHandler, Response } from 'express'

export default class CourseCompletionsController {
  index(): RequestHandler {
    return async (_req: Request, res: Response) => {
      res.render('courseCompletions/index')
    }
  }

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const courseCompletion = {
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: '1990-01-15',
        region: 'North West',
        email: 'john.smith@example.com',
        courseName: 'Health & Safety Level 1',
        courseType: 'Course Type',
        provider: 'Moodle',
        completionDate: '2025-01-15',
        status: 'COMPLETED',
        totalTimeMinutes: '180',
        expectedTimeMinutes: '240',
        attempts: 2,
        externalReference: 'EXT-12345',
      }

      res.render('courseCompletions/show', {
        courseCompletion,
      })
    }
  }
}
