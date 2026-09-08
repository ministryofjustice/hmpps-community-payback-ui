import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { PersonalCircumstancesDto } from '../../@types/shared'
import personalCircumstancesDetailsFactory from './personalCircumstancesDetailsFactory'

export default Factory.define<PersonalCircumstancesDto>(() => ({
  isAllowedTravelTime: faker.datatype.boolean(),
  travelTimeDetails: personalCircumstancesDetailsFactory.build(),
}))
