import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../component/sidebar/sidebar';

@Component({
  selector: 'app-admin-panel-layout',
  imports: [
    RouterOutlet,
    Sidebar
  ],
  templateUrl: './admin-panel-layout.html',
  styleUrl: './admin-panel-layout.css',
})
export class AdminPanelLayout {}
