import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { ProjectDto } from '../../@types/shared'
import locationFactory from './locationFactory'
import beneficiaryDetailsFactory from './beneficiaryDetailsFactory'
import projectTypeFactory from './projectTypeFactory'
import projectAvailabilityFactory from './projectAvailabilityFactory'

export default Factory.define<ProjectDto>(() => ({
  projectName: faker.company.name(),
  projectCode: faker.string.alpha(10),
  projectType: projectTypeFactory.build(),
  providerCode: faker.string.alpha(8),
  teamCode: faker.string.alpha(8),
  location: locationFactory.build(),
  hiVisRequired: faker.datatype.boolean(),
  beneficiaryDetails: beneficiaryDetailsFactory.build(),
  expectedEndDateExclusive: faker.date.future({ years: 1 }).toISOString(),
  actualEndDateExclusive: faker.date.anytime().toISOString(),
  availability: projectAvailabilityFactory.buildList(2),
}))
