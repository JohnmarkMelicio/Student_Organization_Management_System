export interface Payment {

  id?: string;

  type: string;

  eventId?: string | null;

  studentId: string;

  name: string;

  amount: number;

  paymentMethod: string;

  paymentDate: string;

}