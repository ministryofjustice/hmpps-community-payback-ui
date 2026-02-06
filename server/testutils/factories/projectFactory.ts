import { Factory } from 'fishery'
import { faker, fakerEN_GB as fakerEngb } from '@faker-js/faker'
import { ProjectDto } from '../../@types/shared'
import locationFactory from './locationFactory'
import beneficiaryDetailsFactory from './beneficiaryDetailsFactory'

export default Factory.define<ProjectDto>(() => ({
  projectCode: faker.string.alpha(10),
  projectName: faker.company.name(),
  projectLocation: fakerEngb.location.county(),
  location: locationFactory.build(),
  hiVisRequired: faker.datatype.boolean(),
  beneficiaryDetails: beneficiaryDetailsFactory.build(),
}))
