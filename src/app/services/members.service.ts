// src/app/services/members.service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  constructor(private firestore: Firestore) {}

  // ✅ GET ALL MEMBERS
  getAll(): Observable<any[]> {
    const ref = collection(this.firestore, 'members');
    return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
  }

  // ✅ GET MEMBERS BY ORGANIZATION
  getByOrganization(orgId: string): Observable<any[]> {
    const ref = collection(this.firestore, 'members');
    const q = query(ref, where('organizationId', '==', orgId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

}