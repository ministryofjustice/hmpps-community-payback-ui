export default class PersonOnProbation {
  constructor(
    public firstName: string,
    public lastName: string,
    public crn: string,
    public dateOfBirth: Date,
  ) {}

  public getFullName() {
    return `${this.firstName} ${this.lastName}`
  }

  public getNameAndCrnDisplay() {
    return `${this.getFullName()} (${this.crn})`
  }

  public getDisplayName() {
    const initial = this.firstName?.[0]?.toUpperCase() ?? ''
    return `${this.lastName}, ${initial}`
  }
}
