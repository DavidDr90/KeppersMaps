import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { HttpClient } from '@angular/common/http';
import { MapsAPILoader } from '@agm/core';
import { Subject } from 'rxjs/internal/Subject';


@Injectable({
  providedIn: 'root'
})
export class JsonService {

  data$: any;

  private userData = new Subject<any>();
  myLocationMarker: { lat: any; lng: any; };


  constructor() {
    this.data$ = this.userData.asObservable();
  }

  
  setUserData(val: object) {
    this.userData.next(val);
  }

  getUserData() {
    return this.userData;
  }

}

