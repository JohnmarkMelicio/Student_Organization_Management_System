import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsService } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrls: ['./events.scss']
})
export class EventsComponent implements OnInit {

  viewMode: 'create' | 'list' = 'list';

  events: any[] = [];
  filteredEvents: any[] = [];
  searchText: string = '';

  editingId: string | null = null;

  isAdmin = false;

  newEvent: any = {
    name: '',
    date: '',
    location: '',
    organization: '',
    status: ''
  };

  constructor(
    private eventsService: EventsService,
    private authService: AuthService
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

  addEvent(): void {

    if (!this.isAdmin) return;

    if (!this.newEvent.name || !this.newEvent.date) {
      alert("Please complete required fields");
      return;
    }

    // ✅ AUTO SET STATUS
    this.newEvent.status = this.getEventStatus(this.newEvent.date);

    this.eventsService.create(this.newEvent)
      .then(() => {
        alert("Event added successfully");
        this.loadEvents();
        this.resetForm();
        this.viewMode = 'list';
      })
      .catch((err:any) => {
        console.error("Failed to add event", err);
        alert("Error saving event");
      });

  }

  editEvent(event:any): void {
    if (!this.isAdmin) return;
    this.editingId = event.id;
  }

  saveEvent(event:any): void {

    if (!this.isAdmin) return;

    // ✅ AUTO FIX STATUS ON SAVE
    event.status = this.getEventStatus(event.date, event.status);

    this.eventsService.update(event.id, event)
      .then(() => {
        this.editingId = null;
        this.loadEvents();
      })
      .catch((err:any) => console.error("Failed to update event", err));

  }

  deleteEvent(id:string): void {

    if (!this.isAdmin) return;

    const confirmDelete = confirm("Delete this event?");
    if (!confirmDelete) return;

    this.eventsService.delete(id)
      .then(() => this.loadEvents())
      .catch((err:any) => console.error("Failed to delete event", err));

  }

  searchEvents(): void {

    this.filteredEvents = this.events.filter(e =>
      e.name.toLowerCase().includes(this.searchText.toLowerCase())
    );

  }

  resetForm(): void {
    this.newEvent = {
      name: '',
      date: '',
      location: '',
      organization: '',
      status: ''
    };
  }
  cancelEdit(): void {
  this.editingId = null;
  this.loadEvents(); // 🔥 restores original data
}

  // ✅ AUTO STATUS LOGIC
  getEventStatus(date: string, manualStatus?: string): string {

    const today = new Date();
    const eventDate = new Date(date);

    today.setHours(0,0,0,0);
    eventDate.setHours(0,0,0,0);

    if (eventDate.getTime() === today.getTime()) {
      return 'Ongoing';
    }

    if (eventDate > today) {
      return 'Upcoming';
    }

    if (eventDate < today) {
      return 'Completed';
    }

    return manualStatus || 'Upcoming';
  }

}