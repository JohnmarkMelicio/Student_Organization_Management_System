export interface Payment {
  id?: number;
  memberId: number;
  amount: number;
  status: string;
}