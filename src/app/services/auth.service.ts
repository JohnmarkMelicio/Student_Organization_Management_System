import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  async login(studentID: string, password: string) {

  const id = studentID.trim();

  const usersRef = collection(this.firestore, 'users');

  const q = query(usersRef, where('studentID', '==', id));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Student ID not found');
  }

  const docData: any = querySnapshot.docs[0].data();

  console.log("Firestore Data:", docData);

  const email: string = docData.email;

  console.log("Email extracted:", email);

  // directly login
  return signInWithEmailAndPassword(this.auth, email, password);
}

}