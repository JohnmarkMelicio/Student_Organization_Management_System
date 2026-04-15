import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrganizationService } from '../../../services/organization.service';
import { Organization, EMPTY_ORGANIZATION } from '../../../models/organization.model';
import { AuthService } from '../../../services/auth.service';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './organization.html',
  styleUrls: ['./organization.scss']
})
export class OrganizationComponent implements OnInit {

  organizations: Organization[] = [];

  showModal = false;
  editingId: string | null = null;
  activeMenu: string | null = null;

  newOrg: Organization = { ...EMPTY_ORGANIZATION };

  isAdmin: boolean = false;

  constructor(
    private orgService: OrganizationService,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const user: any = await this.authService.getCurrentUserData();

    if (user) {
      this.isAdmin = user['role'] === 'admin';
    }

    this.loadOrganizations();
  }

  // 🔥 FIXED: FORCE ACRONYM PRIORITY
  loadOrganizations(): void {
    this.orgService.getAll().subscribe({
      next: (res) => {
        this.organizations = res.map((org: any) => ({
          ...org,
          acronym: org.acronym || org.shortName || this.generateAcronym(org.name)
        }));
      },
      error: (err) => console.error(err)
    });
  }

  // 🔥 GENERATOR (fallback only)
  generateAcronym(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  toggleMenu(id: string) {
    this.activeMenu = this.activeMenu === id ? null : id;
  }

  addOrganization(): void {
    if (!this.newOrg.name.trim()) return;

    // 🔥 AUTO GENERATE IF EMPTY
    if (!this.newOrg.acronym) {
      this.newOrg.acronym = this.generateAcronym(this.newOrg.name);
    }

    this.orgService.create(this.newOrg)
      .then(() => {
        this.loadOrganizations();
        this.closeModal();
      })
      .catch(err => console.error(err));
  }

  editOrganization(org: Organization) {
    this.editingId = org.id!;
  }

  saveOrganization(org: Organization) {
    this.orgService.update(org.id!, org)
      .then(() => {
        this.editingId = null;
        this.loadOrganizations();
      })
      .catch(err => console.error(err));
  }

  cancelEdit() {
    this.editingId = null;
    this.loadOrganizations();
  }

  deleteOrganization(id: string) {
    const confirmDelete = confirm("Are you sure you want to delete this organization?");
    if (!confirmDelete) return;

    this.orgService.delete(id)
      .then(() => {
        this.activeMenu = null;
        this.loadOrganizations();
      })
      .catch(err => console.error(err));
  }

  openOrganization(id: string): void {
    this.router.navigate(['/home/organization', id]);
  }

  // 🔥 FIXED: REMOVE shortName
  private resetForm(): void {
    this.newOrg = {
      name: '',
      acronym: '', // ✅ USE THIS
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
  }

}