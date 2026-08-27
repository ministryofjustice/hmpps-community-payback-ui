import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { PersonalCircumstancesDto } from '../../@types/shared'

export default Factory.define<PersonalCircumstancesDto>(() => ({
  isAllowedTravelTime: faker.datatype.boolean(),
}))
