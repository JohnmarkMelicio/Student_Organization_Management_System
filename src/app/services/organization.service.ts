import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization } from '../models/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  private api = 'http://localhost:3000/organizations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.api);
  }

  getById(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.api}/${id}`);
  }

  create(data: Organization): Observable<Organization> {
    return this.http.post<Organization>(this.api, data);
  }

  update(id: number, data: Organization): Observable<Organization> {
    return this.http.put<Organization>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}