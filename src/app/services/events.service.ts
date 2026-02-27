import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private api = 'http://localhost:3000/events';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.api);
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.api}/${id}`);
  }

  create(data: Event): Observable<Event> {
    return this.http.post<Event>(this.api, data);
  }

  update(id: number, data: Event): Observable<Event> {
    return this.http.put<Event>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}