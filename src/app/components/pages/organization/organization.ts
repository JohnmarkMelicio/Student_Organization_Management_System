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
import { DialogModule } from 'primeng/dialog';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DialogModule
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
    Swal.fire({
      title: 'Cancel?',
      text: 'Your input will be lost.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d2c6c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showModal = false;
        this.resetForm();
      }
    });
  }

  toggleMenu(id: string) {
    this.activeMenu = this.activeMenu === id ? null : id;
  }

  addOrganization(): void {
    if (!this.newOrg.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Name',
        text: 'Organization name is required'
      });
      return;
    }

    if (!this.newOrg.acronym) {
      this.newOrg.acronym = this.generateAcronym(this.newOrg.name);
    }

    Swal.fire({
      title: 'Creating...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.orgService.create(this.newOrg)
      .then(() => {
        this.loadOrganizations();
        this.showModal = false;
        this.resetForm();

        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Organization added successfully',
          timer: 1500,
          showConfirmButton: false
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create organization'
        });
      });
  }

  editOrganization(org: Organization) {
    this.editingId = org.id!;
  }

  saveOrganization(org: Organization) {
    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.orgService.update(org.id!, org)
      .then(() => {
        this.editingId = null;
        this.loadOrganizations();

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Organization updated',
          timer: 1500,
          showConfirmButton: false
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Update failed'
        });
      });
  }

  cancelEdit() {
    Swal.fire({
      title: 'Cancel changes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
        this.editingId = null;
        this.loadOrganizations();
      }
    });
  }

  deleteOrganization(id: string) {
    Swal.fire({
      title: 'Delete Organization?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orgService.delete(id)
          .then(() => {
            this.activeMenu = null;
            this.loadOrganizations();

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Organization removed',
              timer: 1500,
              showConfirmButton: false
            });
          })
          .catch(() => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Delete failed'
            });
          });
      }
    });
  }

  openOrganization(id: string): void {
    this.router.navigate(['/home/organization', id]);
  }

  private resetForm(): void {
    this.newOrg = {
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
  }
}