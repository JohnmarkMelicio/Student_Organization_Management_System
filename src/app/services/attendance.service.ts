import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private api = 'http://localhost:3000/attendance';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.api);
  }

  getByEvent(eventId: number) {
    return this.http.get<any[]>(`${this.api}?eventId=${eventId}`);
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