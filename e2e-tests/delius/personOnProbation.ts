export default class PersonOnProbation {
  constructor(
    public firstName: string,
    public lastName: string,
    public crn: string,
    public dateOfBirth: Date,
  ) {}

  public getFullName(lastNameFirst = false) {
    if (lastNameFirst) {
      return `${this.lastName}, ${this.firstName}`
    }
    return `${this.firstName} ${this.lastName}`
  }

  public getNameAndCrnDisplay(lastNameFirst = true) {
    return `${this.getFullName(lastNameFirst)} (${this.crn})`
  }

  public getDisplayName() {
    const initial = this.firstName?.[0]?.toUpperCase() ?? ''
    return `${this.lastName}, ${initial}`
  }
}
