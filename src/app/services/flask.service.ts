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
}
