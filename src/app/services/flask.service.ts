import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FlaskService {

  constructor(private http: HttpClient) { }

  FlaskServerUrl = "http://127.0.0.1:5000"

  initMap() {
    return this.http.get(this.FlaskServerUrl, { responseType: 'text' })
  }


  getMap() {
    return this.http.get(this.FlaskServerUrl + "/map", { responseType: 'text' })
  }
  MY_API_KEY_FOR_GOOGLE_MAPS = 'AIzaSyDqvULxK5r9Yw1-a8gDYLJITEcgKfhp1X8';

  getAddress(address: string) {
    if (this.isBlank(address))
      address = "rome italy"
    // replace spaces with '+'
    var fixAddress = address.split(' ').join('+');
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + fixAddress + '&key=' + this.MY_API_KEY_FOR_GOOGLE_MAPS)
  }

  isBlank(str) {
    return (!str || /^\s*$/.test(str) || str.length === 0 || !str.trim());
}

}
