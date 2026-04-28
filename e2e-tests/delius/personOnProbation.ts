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

  public getDisplayName() {
    const initial = this.firstName?.[0]?.toUpperCase() ?? ''
    return `${this.lastName}, ${initial}`
  }
}
