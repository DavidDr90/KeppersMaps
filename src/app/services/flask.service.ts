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


  getMap(param) {
    return this.http.get(this.FlaskServerUrl + "/map", { responseType: 'text' })
  }

  sendParameters(param){
    console.log("in getMap, param:")
    console.log(param)
    param = JSON.stringify(param)
    console.log("Json view:")
    console.log(param)
    return this.http.post(this.FlaskServerUrl + "/filter", param)
  }



  MY_API_KEY_FOR_GOOGLE_MAPS = 'AIzaSyDqvULxK5r9Yw1-a8gDYLJITEcgKfhp1X8';

  getAddress(address: string) {
    if (this.isBlank(address))
      address = "rome italy"
    // replace spaces with '+'
    var fixAddress = address.split(' ').join('+');
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + fixAddress + '&key=' + this.MY_API_KEY_FOR_GOOGLE_MAPS)
  }



  /** check if a given string is empty or null or undefined or white spacess
   * @param str - string to check
   * @return True if the string is empty, else False
   */
  private isBlank(str) {
    return (!str || /^\s*$/.test(str) || str.length === 0 || !str.trim());
  }

}
