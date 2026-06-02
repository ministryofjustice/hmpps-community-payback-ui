import FormClient from '../../data/formClient'
import { CourseCompletionPageInput } from '../../pages/courseCompletionIndexPage'
import courseCompletionFormFactory from '../../testutils/factories/courseCompletionFormFactory'
import CourseCompletionFormService, { COURSE_COMPLETION_PROCESS_FORM_TYPE } from './courseCompletionFormService'

const newId = 'a-random-string-uuid-'

jest.mock('../../data/formClient')
jest.mock('crypto', () => {
  return {
    randomUUID: () => newId,
  }
})

describe('CourseCompletionFormService', () => {
  const formClient = new FormClient(null) as jest.Mocked<FormClient>
  let courseCompletionFormService: CourseCompletionFormService

  beforeEach(() => {
    jest.resetAllMocks()
    courseCompletionFormService = new CourseCompletionFormService(formClient)
  })

  describe('getForm', () => {
    it('should fetch form', async () => {
      const formResult = courseCompletionFormFactory.build()

      formClient.find.mockResolvedValue(formResult)

      const result = await courseCompletionFormService.getForm('1', 'some-name')

      expect(formClient.find).toHaveBeenCalledWith({ id: '1', type: COURSE_COMPLETION_PROCESS_FORM_TYPE }, 'some-name')
      expect(result).toEqual(formResult)
    })
  })

  describe('saveForm', () => {
    it('should save form with provided id and body', async () => {
      const form = courseCompletionFormFactory.build()

      await courseCompletionFormService.saveForm('1', 'some-name', form)
      expect(formClient.save).toHaveBeenCalledWith(
        { id: '1', type: COURSE_COMPLETION_PROCESS_FORM_TYPE },
        'some-name',
        form,
      )
    })
  })

  describe('createForm', () => {
    it('should create a new form', async () => {
      const result = await courseCompletionFormService.createForm('some-name')

      expect(result.formId).toBeTruthy()
      expect(result.formData).toEqual({})
      expect(formClient.save).toHaveBeenCalled()
    })

    it('should create a new form with original search query', async () => {
      const originalSearch: CourseCompletionPageInput = {
        pdu: '1',
        provider: '2',
      }

      const result = await courseCompletionFormService.createForm('some-name', { originalSearch })

      expect(result.formId).toBeTruthy()
      expect(result.formData).toEqual({ originalSearch })
      expect(formClient.save).toHaveBeenCalled()
    })

    it('should create a new form with any data', async () => {
      const originalSearch: CourseCompletionPageInput = {
        pdu: '1',
        provider: '2',
      }

      const crn = '123'
      const data = { crn, originalSearch }

      const result = await courseCompletionFormService.createForm('some-name', data)

      expect(result.formId).toBeTruthy()
      expect(result.formData).toEqual({ crn, originalSearch })
      expect(formClient.save).toHaveBeenCalled()
    })
  })
})
