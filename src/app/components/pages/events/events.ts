import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrls: ['./events.scss']
})
export class EventsComponent {

  api = 'http://localhost:3000/events';

  viewMode: 'create' | 'list' = 'list';

  events: any[] = [];
  filteredEvents: any[] = [];
  searchText: string = '';

  editingId: number | null = null;

  newEvent: any = {
    name: '',
    date: '',
    location: '',
    status: '',
    organization: ''
  };

  constructor(private http: HttpClient) {
    this.loadEvents();
  }

  loadEvents() {
    this.http.get<any[]>(this.api)
      .subscribe(res => {
        this.events = res;
        this.filteredEvents = res;
      });
  }

  addEvent() {
    if (!this.newEvent.name || !this.newEvent.date) {
      alert("Please complete required fields");
      return;
    }

    this.http.post(this.api, this.newEvent)
      .subscribe(() => {
        this.loadEvents();
        this.resetForm();
        this.viewMode = 'list';
      });
  }

  editEvent(event: any) {
    this.editingId = event.id;
  }

  saveEvent(event: any) {
    this.http.put(`${this.api}/${event.id}`, event)
      .subscribe(() => {
        this.editingId = null;
        this.loadEvents();
      });
  }

  deleteEvent(id: number) {
    const confirmDelete = confirm("Delete this event?");
    if (!confirmDelete) return;

    this.http.delete(`${this.api}/${id}`)
      .subscribe(() => {
        this.loadEvents();
      });
  }

  searchEvents() {
    this.filteredEvents = this.events.filter(e =>
      e.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  resetForm() {
    this.newEvent = {
      name: '',
      date: '',
      location: '',
      status: '',
      organization: ''
    };
  }

}