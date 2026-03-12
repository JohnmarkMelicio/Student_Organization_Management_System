import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  docData
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Organization } from '../models/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  constructor(private firestore: Firestore) {}

  getAll(): Observable<Organization[]> {

    const ref = collection(this.firestore, 'organizations');

    return collectionData(ref, { idField: 'id' }) as Observable<Organization[]>;

  }

  getById(id: string): Observable<Organization> {

    const ref = doc(this.firestore, `organizations/${id}`);

    return docData(ref, { idField: 'id' }) as Observable<Organization>;

  }

  create(data: Organization) {

    const ref = collection(this.firestore, 'organizations');

    return addDoc(ref, data as any);

  }

  update(id: string, data: Organization) {

    const ref = doc(this.firestore, `organizations/${id}`);

    return updateDoc(ref, data as any);

  }

  delete(id: string) {

    const ref = doc(this.firestore, `organizations/${id}`);

    return deleteDoc(ref);

  }

}