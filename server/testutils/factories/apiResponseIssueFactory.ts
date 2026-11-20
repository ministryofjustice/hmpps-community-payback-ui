import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { ApiResponseIssue } from '../../@types/shared'

export default Factory.define<ApiResponseIssue>(() => ({
  field: '',
  code: 'BAD_REQUEST',
  data: { message: faker.lorem.sentence() },
}))
