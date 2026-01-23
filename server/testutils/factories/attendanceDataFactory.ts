import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AttendanceDataDto } from '../../@types/shared'

export default Factory.define<AttendanceDataDto>(() => ({
  hiVisWorn: faker.datatype.boolean(),
  workedIntensively: faker.datatype.boolean(),
  penaltyMinutes: 60,
  workQuality: 'GOOD',
  behaviour: 'NOT_APPLICABLE',
}))
