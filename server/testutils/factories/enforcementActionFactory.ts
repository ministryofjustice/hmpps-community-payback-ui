import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { EnforcementActionDto, EnforcementActionsDto } from '../../@types/shared'
import EnforcementPage from '../../pages/appointments/enforcementPage'

export const enforcementActionFactory = Factory.define<EnforcementActionDto>(() => ({
  id: faker.string.uuid(),
  name: faker.word.verb(),
  code: faker.string.sample(10),
  respondByDateRequired: faker.datatype.boolean(),
}))

export const enforcementActionsFactory = Factory.define<EnforcementActionsDto>(() => ({
  enforcementActions: [
    ...enforcementActionFactory.buildList(2),
    enforcementActionFactory.build({ code: EnforcementPage.offenderManagerCode, name: 'Refer to Offender Manager' }),
  ],
}))
