import { Factory } from 'fishery'
import { AttendanceDataDto } from '../../@types/shared'

export default Factory.define<AttendanceDataDto>(() => ({
  penaltyMinutes: 60,
  workQuality: 'GOOD',
  behaviour: 'NOT_APPLICABLE',
}))
