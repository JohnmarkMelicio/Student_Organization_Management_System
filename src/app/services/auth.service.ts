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

  async getCurrentUserData() {

    const currentUser = this.auth.currentUser;

    if (!currentUser) return null;

    const email = currentUser.email;

    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    return querySnapshot.docs[0].data();
  }

  async login(studentID: string, password: string) {

    const id = studentID.trim();

    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('studentID', '==', id));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Student ID not found');
    }

    const docData: any = querySnapshot.docs[0].data();

    const email: string = docData.email;

    if (!email) {
      throw new Error('Email not found');
    }

    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }
}