import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsService } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    DialogModule,
    SelectModule
  ],
  templateUrl: './events.html',
  styleUrls: ['./events.scss']
})
export class EventsComponent implements OnInit {

  viewMode: 'create' | 'list' = 'list';

  events: any[] = [];
  filteredEvents: any[] = [];
  searchText: string = '';

  organizations: any[] = [];

  editingId: string | null = null;
  expandedEventId: string | null = null;

  isAdmin = false;

  showEventModal = false;
  showEditModal: boolean = false;
  selectedEvent: any = {};

  // ✅ FIXED EVENT MODEL
  newEvent: any = {
    name: '',
    date: '',
    location: '',
    organization: '',
    status: '',
    startTime: '',
    endTime: ''
  };

  constructor(
    private eventsService: EventsService,
    private authService: AuthService,
    private firestore: Firestore,
  ) {}

  async ngOnInit(): Promise<void> {

    const user = await this.authService.getCurrentUserData();

    if (user) {
      this.isAdmin = user['role'] === 'admin';
    }

    if (!this.isAdmin) {
      this.viewMode = 'list';
    }

    this.loadEvents();
    this.loadOrganizations();
  }

  formatTime(time: string): string {
  if (!time) return '-';

  const [hour, minute] = time.split(':');
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';

  h = h % 12;
  h = h ? h : 12; // 0 becomes 12

  return `${h}:${minute} ${ampm}`;
}

toggleRow(event: any) {
  this.expandedEventId =
    this.expandedEventId === event.id ? null : event.id;
}

  loadEvents(): void {
    this.eventsService.getAll().subscribe({
      next: (res) => {
        this.events = res;
        this.filteredEvents = res;
      },
      error: (err) => console.error('Failed to load events', err)
    });
  }

  loadOrganizations(): void {
    const ref = collection(this.firestore, 'organizations');

    collectionData(ref, { idField: 'id' }).subscribe((res: any) => {
      this.organizations = res;
    });
  }

  selectOrganization(event: any) {
    this.newEvent.organization = event.target.value;
  }

  openEventModal(): void {
    this.showEventModal = true;
  }

  addEvent(): void {

    if (!this.isAdmin) return;

    if (!this.newEvent.name || !this.newEvent.date) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please complete required fields',
        target: document.body
      });
      return;
    }

    // ✅ AUTO STATUS
    this.newEvent.status = this.getEventStatus(this.newEvent.date);

    Swal.fire({
      title: 'Adding event...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      target: document.body
    });

    this.eventsService.create(this.newEvent)
      .then(() => {

        Swal.fire({
          icon: 'success',
          title: 'Event Added!',
          timer: 1200,
          showConfirmButton: false,
          target: document.body
        });

        this.loadEvents();
        this.resetForm();
        this.showEventModal = false;
        this.viewMode = 'list';

      })
      .catch((err: any) => {
        console.error("Failed to add event", err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to save event',
          target: document.body
        });
      });

  }
  

  editEvent(event: any): void {
    if (!this.isAdmin) return;
    this.editingId = event.id;
  }

  saveEvent(event: any): void {

    if (!this.isAdmin) return;

    event.status = this.getEventStatus(event.date, event.status);

    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      target: document.body
    });

    this.eventsService.update(event.id, event)
      .then(() => {

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          timer: 1000,
          showConfirmButton: false,
          target: document.body
        });

        this.editingId = null;
        this.loadEvents();

      })
      .catch((err: any) => {
        console.error("Failed to update event", err);

        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          target: document.body
        });
      });

  }

  openEditModal(event: any) {
  this.selectedEvent = { ...event };
  this.showEditModal = true;
}

 async updateEvent() {
  try {

    // 🚫 PREVENT undefined
    if (!this.selectedEvent.organizationId) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Organization',
        text: 'Please select an organization before saving'
      });
      return;
    }

    await this.eventsService.update(this.selectedEvent.id, {
      name: this.selectedEvent.name,
      date: this.selectedEvent.date,
      startTime: this.selectedEvent.startTime,
      endTime: this.selectedEvent.endTime,
      location: this.selectedEvent.location,
      status: this.selectedEvent.status,
      organizationId: this.selectedEvent.organizationId
    });

    Swal.fire({
      icon: 'success',
      title: 'Saved!',
      timer: 1200,
      showConfirmButton: false
    });

    this.showEditModal = false;

  } catch (err: any) {
    Swal.fire('Error', err.message, 'error');
  }
}

  getOrganizationName(id: string): string {
  const org = this.organizations.find(o => o.id === id);
  return org ? org.name : 'Unknown';
}

  deleteEvent(id: string): void {

    if (!this.isAdmin) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This event will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      target: document.body
    }).then((result) => {

      if (result.isConfirmed) {

        Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          target: document.body
        });

        this.eventsService.delete(id)
          .then(() => {

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Event has been removed.',
              timer: 1200,
              showConfirmButton: false,
              target: document.body
            });

            this.loadEvents();

          })
          .catch((err: any) => {
            console.error("Failed to delete event", err);

            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              target: document.body
            });
          });

      }

    });

  }

  searchEvents(): void {
    this.filteredEvents = this.events.filter(e =>
      e.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // ✅ FIXED RESET (IMPORTANT)
  resetForm(): void {
    this.newEvent = {
      name: '',
      date: '',
      location: '',
      organization: '',
      status: '',
      startTime: '',
      endTime: ''
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.loadEvents();
  }

  getEventStatus(date: string, manualStatus?: string): string {

    const today = new Date();
    const eventDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) return 'Ongoing';
    if (eventDate > today) return 'Upcoming';
    if (eventDate < today) return 'Completed';

    return manualStatus || 'Upcoming';
  }

}