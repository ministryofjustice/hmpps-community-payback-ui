import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { EnforcementActionDto, EnforcementActionsDto } from '../../@types/shared'

export const enforcementActionFactory = Factory.define<EnforcementActionDto>(() => ({
  id: faker.string.uuid(),
  name: faker.word.verb(),
  code: faker.string.sample(10),
  respondByDateRequired: faker.datatype.boolean(),
}))

export const enforcementActionsFactory = Factory.define<EnforcementActionsDto>(() => ({
  enforcementActions: enforcementActionFactory.buildList(2),
}))
