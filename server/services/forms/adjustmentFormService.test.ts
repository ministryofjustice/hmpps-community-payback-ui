import { createMock } from '@golevelup/ts-jest'
import FormClient from '../../data/formClient'
import AdjustmentFormService from './adjustmentFormService'

describe('AdjustmentFormService', () => {
  let formClient: FormClient
  let adjustmentFormService: AdjustmentFormService

  beforeEach(() => {
    formClient = createMock<FormClient>()
    adjustmentFormService = new AdjustmentFormService(formClient)
  })

  describe('createAdjustmentForm', () => {
    it('should create a new adjustment form with default values and the correct originalPath', async () => {
      const username = 'testuser'
      const query = { originalPath: '/test-path' }

      const form = await adjustmentFormService.createAdjustmentForm(username, query)

      expect(form.data).toEqual({
        originalPath: '/test-path',
        type: 'Negative',
        adjustmentReasonId: '',
        adjustmentDate: '',
        appointmentId: '',
      })
      expect(form.key.id).toBeDefined()
      expect(form.key.type).toBe('ADJUSTMENT_UPDATE_FORM_TYPE')

      expect(formClient.save).toHaveBeenCalledWith(
        { type: 'ADJUSTMENT_UPDATE_FORM_TYPE', id: form.key.id },
        username,
        form.data,
      )
    })
  })
})
