import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { SupervisorSummaryDto } from '../../@types/shared'
import nameFactory from './nameFactory'
import gradeFactory from './gradeFactory'

export default Factory.define<SupervisorSummaryDto>(() => ({
  code: faker.string.alpha(8),
  fullName: faker.person.fullName(),
  name: nameFactory.build(),
  grade: gradeFactory.build(),
  unallocated: faker.datatype.boolean(),
}))
