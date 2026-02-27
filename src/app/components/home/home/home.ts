import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { Content } from '../content/content';

@Component({
  selector: 'app-home',
  imports: [Sidebar, Topbar, Content],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  

}
