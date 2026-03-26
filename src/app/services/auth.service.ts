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

    async login(input: string, password: string) {

    const value = input.trim();

    const usersRef = collection(this.firestore, 'users');

    // =========================
    // 🔥 IF EMAIL → ADMIN ONLY
    // =========================
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

    // =========================
    // 🔥 IF STUDENT ID → STUDENT ONLY
    // =========================
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