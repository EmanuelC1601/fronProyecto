import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Proyecto Angular Completo';
  fechaActual = new Date();

  ngOnInit() {
    setInterval(() => {
      this.fechaActual = new Date();
    }, 60000);
  }
}