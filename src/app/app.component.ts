import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  showMap: boolean = false;

  constructor() { }
  
  public setShowMap(event) {
    this.showMap = event;
  }

}
