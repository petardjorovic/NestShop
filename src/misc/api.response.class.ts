export class ApiResponse {
  constructor(
    public status: string,
    public code: number,
    public msg?: string,
  ) {
    this.status = status;
    this.code = code;
    this.msg = msg;
  }
}
