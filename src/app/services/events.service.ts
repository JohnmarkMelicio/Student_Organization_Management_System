import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private firestore: Firestore) {}

  getAll(): Observable<Event[]> {
    const ref = collection(this.firestore, 'events');
    return collectionData(ref, { idField: 'id' }) as Observable<Event[]>;
  }

  create(data: Event) {
    const ref = collection(this.firestore, 'events');
    return addDoc(ref, data as any);
  }

  update(id: string, data: Event) {
    const ref = doc(this.firestore, `events/${id}`);
    return updateDoc(ref, data as any);
  }

  delete(id: string) {
    const ref = doc(this.firestore, `events/${id}`);
    return deleteDoc(ref);
  }

}