import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FlaskService {

  MY_API_KEY_FOR_GOOGLE_MAPS = 'AIzaSyDqvULxK5r9Yw1-a8gDYLJITEcgKfhp1X8';

  // TODO: change to production server address
  FlaskServerUrl = "http://127.0.0.1:5000"

  constructor(private http: HttpClient) { }


  initMap() {
    return this.http.get(this.FlaskServerUrl, { responseType: 'text' })
  }


  getMap() {
    return this.http.get(this.FlaskServerUrl + "/map", { responseType: 'text' })
  }


  /** use http post message to send the param data to the server
   * @param param parameters to post to the server
   */
  sendParameters(param) {
    return this.http.post(this.FlaskServerUrl + "/filter", JSON.stringify(param))
  }


  /** send address to the GoogleMape server and return the location in lat and lng
   *  if the input address is empty use defualt address: 'rome italy'
   * @param address to convert to location data
   */
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
