import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrganizationService } from '../../../services/organization.service';
import { Organization, EMPTY_ORGANIZATION } from '../../../models/organization.model';
import { AuthService } from '../../../services/auth.service'; // ✅ ADDED

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organization.html',
  styleUrls: ['./organization.scss']
})
export class OrganizationComponent implements OnInit {

  organizations: Organization[] = [];

  showModal = false;
  editingId: string | null = null;

  newOrg: Organization = { ...EMPTY_ORGANIZATION };

  isAdmin: boolean = false; // ✅ ADDED

  constructor(
    private orgService: OrganizationService,
    private router: Router,
    private authService: AuthService // ✅ ADDED
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

      next: (res) => this.organizations = res,
      error: (err) => console.error(err)

    });

  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  addOrganization(): void {

    if (!this.newOrg.name.trim()) return;

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

    const confirmDelete = confirm("Delete this organization?");
    if (!confirmDelete) return;

    this.orgService.delete(id)
      .then(() => this.loadOrganizations())
      .catch(err => console.error(err));

  }

  openOrganization(id: string): void {
    this.router.navigate(['/home/organization', id]);
  }

  private resetForm(): void {
    this.newOrg = { ...EMPTY_ORGANIZATION };
  }

}