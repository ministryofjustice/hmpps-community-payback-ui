import { Factory } from 'fishery'
import { faker, fakerEN_GB as fakerEngb } from '@faker-js/faker'
import { BeneficiaryDetailsDto } from '../../@types/shared'
import locationFactory from './locationFactory'

export default Factory.define<BeneficiaryDetailsDto>(() => ({
  beneficiary: faker.company.name(),
  contactName: faker.person.fullName(),
  emailAddress: faker.internet.email(),
  website: faker.internet.url(),
  telephoneNumber: fakerEngb.phone.number({ style: 'national' }),
  locationDto: locationFactory.build(),
}))
