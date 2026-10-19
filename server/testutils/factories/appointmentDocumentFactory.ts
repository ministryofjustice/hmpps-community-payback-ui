import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AppointmentDocumentDto } from '../../@types/shared'

export default Factory.define<AppointmentDocumentDto>(() => ({
  documentId: faker.number.int(),
  filename: faker.system.commonFileName(),
}))
