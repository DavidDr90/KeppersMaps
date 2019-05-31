import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

const DEFUALT_LATITUDE = 41.9028, DEFUALT_LONGITUDE = 12.4964;//Rome Italy


@Injectable({
  providedIn: 'root'
})
export class JsonService {

  data$: any;

  private userData = new Subject<any>();
  myLocationMarker: { lat: any; lng: any; } = {
    "lat": DEFUALT_LATITUDE,
    "lng": DEFUALT_LONGITUDE
  };


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

