import FormClient from '../../data/formClient'
import recordActivityFormFactory from '../../testutils/factories/recordActivityFormFactory'
import RecordActivityFormService, { RECORD_ACTIVITY_FORM_TYPE } from './recordActivityFormService'

const newId = 'a-random-string-uuid'

jest.mock('../../data/formClient')
jest.mock('crypto', () => {
  return {
    randomUUID: () => newId,
  }
})

describe('RecordActivityFormService', () => {
  const formClient = new FormClient(null) as jest.Mocked<FormClient>
  let recordActivityFormService: RecordActivityFormService

  beforeEach(() => {
    jest.resetAllMocks()
    recordActivityFormService = new RecordActivityFormService(formClient)
  })

  describe('getForm', () => {
    it('should fetch form', async () => {
      const formResult = recordActivityFormFactory.build()

      formClient.find.mockResolvedValue(formResult)

      const result = await recordActivityFormService.getForm('1', 'some-name')

      expect(formClient.find).toHaveBeenCalledWith({ id: '1', type: RECORD_ACTIVITY_FORM_TYPE }, 'some-name')
      expect(result).toEqual(formResult)
    })
  })

  describe('saveForm', () => {
    it('should save form with provided id and body', async () => {
      const form = recordActivityFormFactory.build()

      await recordActivityFormService.saveForm('1', 'some-name', form)

      expect(formClient.save).toHaveBeenCalledWith({ id: '1', type: RECORD_ACTIVITY_FORM_TYPE }, 'some-name', form)
    })
  })

  describe('createForm', () => {
    it('should create a new form for the given crn and delius event number, defaulting to the OTHER_ETE project type group', async () => {
      const result = await recordActivityFormService.createForm('some-name', {
        crn: 'X123456',
        deliusEventNumber: '2',
      })

      expect(result.formId).toEqual(newId)
      expect(result.formData).toEqual({ crn: 'X123456', deliusEventNumber: '2', projectTypeGroup: 'OTHER_ETE' })
      expect(formClient.save).toHaveBeenCalledWith({ id: newId, type: RECORD_ACTIVITY_FORM_TYPE }, 'some-name', {
        crn: 'X123456',
        deliusEventNumber: '2',
        projectTypeGroup: 'OTHER_ETE',
      })
    })
  })
})
