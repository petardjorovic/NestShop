export class JwtDataAdministratorDto {
  constructor(
    public administratorId: number,
    public username: string,
    public ip?: string,
    public ua?: string,
  ) {}

  toPlainObject() {
    return {
      administratorId: this.administratorId,
      username: this.username,
      ip: this.ip,
      ua: this.ua,
    };
  }
}
