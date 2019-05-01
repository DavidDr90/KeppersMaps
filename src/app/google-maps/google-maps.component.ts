import { Component, OnInit, ViewChild } from '@angular/core';
import { JsonService } from '../services/json.service';
import { AgmMap } from '@agm/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


//TODO: make a welcome windoew where the user enter the first args, like data and subjects
//      later on the user can change this arges

declare var google: any;
const DEFUALT_LATITUDE = 51.5074, DEFUALT_LONGITUDE = 0.1278;//London UK

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.css']
})
export class GoogleMapsComponent implements OnInit {

  @ViewChild('AgmMap') agmMap: AgmMap;

  

  MarkersList: any;
  /*[
    {
      "lat": -1.07415771484375,
      "lng": 52.49164465653034,
      "labelOptions": this.labelOptions,
      "data": null
    },
    {
      "text": 200,
      "lat": -5.07415771484375,
      "lng": 55.49164465653034,
    },
    {
      "text": 300,
      "lat": -7.07415771484375,
      "lng": 20.49164465653034,
    },
  ]*/


  data: any;
  mapsZoom: any;

  lat: number = DEFUALT_LATITUDE;
  lng: number = DEFUALT_LONGITUDE;
  userCurrentLocation: any;

  // TODO: change the map css style to match the current screen size
  screenHeight;
  screenWidth;

  map: any;
  private alive: Subject<void> = new Subject();
  myLocationMarker: { lat: any; lng: any; };
  myLocationMarkerLabelOptions = null


  constructor(private jsonService: JsonService) {
    // listen to changes in the json data from the menu component
    // if there is data save it localy and display it on the map
    jsonService.data$
      .pipe(takeUntil(this.alive))
      .subscribe(
        (data) => {
          console.log("in google maps constructor!")
          data = JSON.parse(data)
          console.log(data)
          this.MarkersList = data['Markers'];
          console.log("MarkersList")
          console.log(this.MarkersList)
        });
  }


  /** When the component is destory close 
   *  the subscribe of the json data
   *  To free all memory use
   */
  ngOnDestroy() {
    console.log('ngOnDestory');
    this.alive.next();
    this.alive.complete();
  }


  /** on component init
   * ask the user for prumssion to get his location
   * then send the location to the map
   * the map will center on the user location
   * if the user refuse use the center of the world.
   */
  ngOnInit() {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.userCurrentLocation = position;
          this.setLocation(position);
        },
        error => {
          switch (error.code) {
            case 1:
              console.error('User Location: Permission Denied');
              break;
            case 2:
              console.error('User Location: Position Unavailable');
              break;
            case 3:
              console.error('User Location: Timeout');
              break;
          }
          this.userCurrentLocation = undefined;
          this.setLocation(this.userCurrentLocation);
        });
    }
  }


  /** init the map using the input location
   * initiate the map on the page
   * zoom is the display distance from the ground.
   * @param {the user current postion, if undefined use Defualt position} position 
   */
  setLocation(position) {
    var myLatLng;

    if (position != undefined) {
      myLatLng = { lat: position.coords.latitude, lng: position.coords.longitude };
    } else {
      myLatLng = { lat: DEFUALT_LATITUDE, lng: DEFUALT_LONGITUDE };
    }
    this.userCurrentLocation = myLatLng;
    this.lat = myLatLng.lat;
    this.lng = myLatLng.lng;
  }


  /** ajust the size of the map depend on the device 
   * for mobile device like Android or iOS set the size to 100%
   * for browsers set by px
   */
  detectBrowser() {
    var useragent = navigator.userAgent;
    var mapdiv = document.getElementById("googleMap");

    if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1) {
      console.info("iOS or Android Device")
      mapdiv.style.width = '100%';
      mapdiv.style.height = '100%';
    } else {
      console.info("Browser Device");
      mapdiv.style.width = '600px';
      mapdiv.style.height = '800px';
    }
  }


  /** this function fire each time the user zoom in or zoom out in the map
   * @param e the zoom level, 0 to 22, 0 is the whole world
   */
  onZoomChange(e) {
    console.log("zoom!1");
    console.log(e);
    this.mapsZoom = e;
  }

  /** Add new marker on the map where the user clicked
   *  Save the location of the marker to the jsonService paramter
   * @param $event click event on the map
   */
  mapClicked($event) {
    this.myLocationMarker = {
      lat: Number($event.coords.lat).toFixed(6),
      lng: Number($event.coords.lng).toFixed(6)
    }
    this.jsonService.myLocationMarker = this.myLocationMarker
  }

  /** check if the input array is not empty
   * @param array 
   * @returns true if the array is not empty false if the array is empty
   */
  private arrayNotEmpty(array: any): boolean {
    if (!Array.isArray(array) || !array.length)
      // array does not exist, is not an array, or is empty
      return false;
    return true;
  }
}

