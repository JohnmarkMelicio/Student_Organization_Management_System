import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Firestore,
  doc,
  docData,
  collection,
  collectionData,
  addDoc,
  query,
  where,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';

import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-organization-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DividerModule,
    CardModule,
    DialogModule,
    InputTextModule,
    AvatarModule
  ],
  templateUrl: './organization-details.html',
  styleUrls: ['./organization-details.scss']
})
// KEEP ALL YOUR IMPORTS (UNCHANGED)

export class OrganizationDetailsComponent {

  organization: any = null;
  members: any[] = [];
  isEditMode: boolean = false;

  get sortedMembers() {
    return this.getSortedMembers(); // ✅ KEEP YOUR FUNCTION
  }

  showOfficerModal = false;
  showEditModal = false;
  showEditOfficerModal = false;

  selectedMember: any = {};
  selectedFileBase64: string = '';

  isAdmin = false;

  searchTerm: string = '';
  previewImage: string | null = null;

  newMember: any = {
    name: '',
    position: '',
    age: '',
    course: '',
    year: '',
    organizationId: ''
  };

  editOrg: any = {
    name: '',
    acronym: '',
    description: '',
    email: '',
    phone: '',
    location: '',
    mission: '',
    vision: '',
    social: {
      facebook: '',
      instagram: ''
    }
  };

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private authService: AuthService
  ) {
    const id = this.route.snapshot.params['id'];

    this.loadOrganization(id);
    this.loadMembers(id);
    this.checkRole();
  }

  async checkRole() {
    const user: any = await this.authService.getCurrentUserData();
    if (user) this.isAdmin = user.role === 'admin';
  }

  // =========================
  // ORGANIZATION (UNCHANGED)
  // =========================

  loadOrganization(id: string) {
    const ref = doc(this.firestore, `organizations/${id}`);

    docData(ref, { idField: 'id' }).subscribe((res: any) => {
      if (!res) return;

      this.organization = {
        id: res.id,
        name: res.name || '',
        acronym: res.acronym || '',
        description: res.description || '',
        email: res.email || '',
        phone: res.phone || '',
        location: res.location || '',
        mission: res.mission || '',
        vision: res.vision || '',
        social: {
          facebook: res.social?.facebook || '',
          instagram: res.social?.instagram || ''
        }
      };
    });
  }

  // =========================
  // MEMBERS (SORT FIXED)
  // =========================

  loadMembers(orgId: string) {
    const ref = collection(this.firestore, 'members');
    const q = query(ref, where('organizationId', '==', orgId));

    collectionData(q, { idField: 'id' }).subscribe((res: any) => {

      const normalize = (val: string) =>
        (val || '')
          .toLowerCase()
          .replace(/\u00A0/g, ' ')
          .replace(/[^a-z]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

      const getRank = (pos: string) => {
        const p = normalize(pos);

        if (p === 'president') return 1;
        if (p === 'vice president') return 2;
        if (p === 'secretary') return 3;
        if (p === 'treasurer') return 4;
        if (p === 'auditor') return 5;

        return 999;
      };

      const data = (res || []).map((m: any) => ({ ...m }));

      data.sort((a: any, b: any) => {
        return getRank(a.position) - getRank(b.position);
      });

      this.members = [...data];

      console.log('FINAL ORDER:', this.members.map(m => m.position));
    });
  }

  // =========================
  // SEARCH (UNCHANGED)
  // =========================

  filteredMembers() {
    const source = this.members;

    if (!this.searchTerm) return source;

    return source.filter(m =>
      m.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      m.position?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // =========================
  // KEEP YOUR FUNCTION
  // =========================

  getSortedMembers() {
    return this.members;
  }

  // =========================
  // FILE UPLOAD (UNCHANGED)
  // =========================

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedFileBase64 = reader.result as string;
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // =========================
  // 🔥 FINAL FIX HERE
  // =========================

  saveMember() {
  console.log('MODE:', this.isEditMode ? 'EDIT' : 'ADD');
  console.log('SELECTED ID:', this.selectedMember?.id);

  if (this.isEditMode) {
    this.updateMember();
  } else {
    this.addMember();
  }
}

  addMember() {
  if (!this.newMember.name || !this.newMember.position) {
    Swal.fire({
      title: 'Error',
      text: 'Name & Position required',
      icon: 'error',
      target: document.body
    });
    return;
  }

  // 🔥 FORCE correct orgId
  const orgId = this.organization?.id;

  if (!orgId) {
    console.error('❌ organization.id is missing');
    return;
  }

  const ref = collection(this.firestore, 'members');

  const dataToSave = {
    name: this.newMember.name,
    position: this.newMember.position,
    age: this.newMember.age,
    course: this.newMember.course,
    year: this.newMember.year,
    organizationId: orgId, // ✅ GUARANTEED
    imageUrl: this.selectedFileBase64 || ''
  };

  console.log('SAVING MEMBER:', dataToSave); // 🔥 DEBUG

  addDoc(ref, dataToSave).then(() => {
    addDoc(ref, dataToSave)
  .then(() => {
    console.log('✅ SAVED SUCCESSFULLY');
  })
  .catch((err) => {
    console.error('❌ ERROR SAVING:', err);
  });
    Swal.fire({
      title: 'Success',
      text: 'Officer saved!',
      icon: 'success',
      target: document.body
    });

    this.resetMemberForm();
    this.showOfficerModal = false;
  });
}

  updateMember() {
  if (!this.selectedMember?.id) {
    console.error('❌ No selected member ID');
    return;
  }

  const ref = doc(this.firestore, `members/${this.selectedMember.id}`);

  const updatedData = {
    name: this.newMember.name,
    position: this.newMember.position,
    age: this.newMember.age,
    course: this.newMember.course,
    year: this.newMember.year,
    organizationId: this.organization.id,
    imageUrl: this.selectedFileBase64 || this.selectedMember.imageUrl || ''
  };

  updateDoc(ref, updatedData).then(() => {
    Swal.fire({
      title: 'Updated!',
      icon: 'success',
      target: document.body
    });

    this.resetMemberForm();
    this.showOfficerModal = false;
  });
}

  deleteMember(member: any) {
    Swal.fire({
      title: 'Delete officer?',
      icon: 'warning',
      showCancelButton: true,
      target: document.body
    }).then(res => {
      if (res.isConfirmed) {
        const ref = doc(this.firestore, `members/${member.id}`);
        deleteDoc(ref).then(() => {
          Swal.fire({
            title: 'Deleted!',
            icon: 'success',
            target: document.body
          });
        });
      }
    });
  }

  editInline(member: any) {
  this.selectedMember = { ...member }; // 🔥 THIS WAS MISSING BEFORE

  this.newMember = { ...member };

  this.previewImage = member.imageUrl || null;
  this.selectedFileBase64 = member.imageUrl || '';

  this.isEditMode = true; // 🔥 CRITICAL
}

  openEditOfficerModal(member: any) {
    this.selectedMember = { ...member };

    this.newMember = { ...member }; // 🔥 IMPORTANT
    this.previewImage = member.imageUrl || null;
    this.selectedFileBase64 = member.imageUrl || '';

    this.isEditMode = true;
    this.showOfficerModal = true;
  }

  openOfficerModal() {
    this.resetMemberForm();
    this.isEditMode = false;
    this.showOfficerModal = true;
  }

  openEditModal() {
    this.editOrg = {
      ...this.organization,
      social: {
        facebook: this.organization.social?.facebook || '',
        instagram: this.organization.social?.instagram || ''
      }
    };

    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  updateOrganization() {
    const ref = doc(this.firestore, `organizations/${this.organization.id}`);

    updateDoc(ref, {
      ...this.editOrg,
      social: {
        facebook: this.editOrg.social?.facebook || '',
        instagram: this.editOrg.social?.instagram || ''
      }
    }).then(() => {
      Swal.fire({
        title: 'Updated!',
        icon: 'success',
        target: document.body
      });
      this.showEditModal = false;
    });
  }

  resetMemberForm() {
    this.newMember = {
      name: '',
      position: '',
      age: '',
      course: '',
      year: '',
      organizationId: ''
    };

    this.selectedMember = {};
    this.selectedFileBase64 = '';
    this.previewImage = null;
    this.isEditMode = false;
  }

  goBack() {
    history.back();
  }
}