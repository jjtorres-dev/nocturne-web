import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  imports: [MatCardModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {}
