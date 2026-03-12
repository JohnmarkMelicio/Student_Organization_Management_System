import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsService } from '../../../services/events.service';

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

  newEvent: any = {
    name: '',
    date: '',
    location: '',
    status: '',
    organization: ''
  };

  constructor(private eventsService: EventsService) {}

  ngOnInit(): void {
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

    console.log("SAVE BUTTON CLICKED");

    if (!this.newEvent.name || !this.newEvent.date) {
      alert("Please complete required fields");
      return;
    }

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
    this.editingId = event.id;
  }

  saveEvent(event:any): void {

    this.eventsService.update(event.id, event)
      .then(() => {
        this.editingId = null;
        this.loadEvents();
      })
      .catch((err:any) => console.error("Failed to update event", err));

  }

  deleteEvent(id:string): void {

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
      status: '',
      organization: ''
    };

  }

}