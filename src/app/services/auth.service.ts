import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  async getCurrentUserData() {

    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;

    const email = currentUser.email;

    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data();
  }

  async getUserDocByEmail(email: string) {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      data: snapshot.docs[0].data()
    };
  }

  async login(input: string, password: string) {

    const value = input.trim();
    const usersRef = collection(this.firestore, 'users');

    if (value.includes('@')) {

      const q = query(usersRef, where('email', '==', value));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Account not found');
      }

      const userData: any = snapshot.docs[0].data();

      if (userData.role !== 'admin') {
        throw new Error('Students must login using Student ID');
      }

      return signInWithEmailAndPassword(this.auth, value, password);
    }

    const q = query(usersRef, where('studentID', '==', value));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Student ID not found');
    }

    const userData: any = snapshot.docs[0].data();

    if (userData.role !== 'student') {
      throw new Error('Admin must login using Email');
    }

    const email = userData.email;

    return signInWithEmailAndPassword(this.auth, email, password);
  }
}