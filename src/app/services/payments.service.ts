import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  private api = 'http://localhost:3000/payments';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.api);
  }

  getByType(type: string) {
    return this.http.get<any[]>(`${this.api}?type=${type}`);
  }

  create(data: any) {
    return this.http.post(this.api, data);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}