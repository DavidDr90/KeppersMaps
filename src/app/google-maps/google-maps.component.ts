import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { JsonService } from '../services/json.service';
import { AgmMap, MapsAPILoader } from '@agm/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { FlaskService } from '../services/flask.service';
import { HostListener } from "@angular/core";

declare var google: any;
const DEFUALT_LATITUDE = 41.9028, DEFUALT_LONGITUDE = 12.4964;//Rome Italy

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.css']
})
export class GoogleMapsComponent implements OnInit {

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    document.getElementById("map").style.width = this.screenWidth + "px"
    let navBerSize = 80;
    document.getElementById("map").style.height = (this.screenHeight - navBerSize) + "px"
    console.log(this.screenHeight, this.screenWidth);
  }

  @ViewChild('AgmMap') agmMap: AgmMap;

  // for the search box
  public searchControl: FormControl;

  // Main markers array
  MarkersList: any;

  data: any;
  mapsZoom: any;
  address: any;

  info: any = '<table style="width:100%">' +
    '<tr>' +
    '<th>Firstname</th>' +
    '<th>Lastname</th> ' +
    '<th>Age</th>' +
    '</tr>' +
    '<tr>' +
    '<td>Jill</td>' +
    '<td>Smith</td> ' +
    '<td>50</td>' +
    '</tr>' +
    '<tr>' +
    '<td>Eve</td>' +
    '<td>Jackson</td> ' +
    '<td>94</td>' +
    '</tr>' +
    '</table>'




  // for the AGM map
  zoom: number = 5;
  lat: number = DEFUALT_LATITUDE;
  lng: number = DEFUALT_LONGITUDE;
  userCurrentLocation: any;

  screenHeight;
  screenWidth;

  map: any;
  private alive: Subject<void> = new Subject();
  myLocationMarker: { lat: any; lng: any; };
  myLocationMarkerLabelOptions = null


  constructor(private jsonService: JsonService, private flaskService: FlaskService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone) {
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
    // free the subscrip for prevent memory leaks
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
    //set current position
    this.setCurrentPosition();
    this.onResize();

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

  private setCurrentPosition() {
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

  /** when the map is ready set the search box and the menu component  
   * 
   */
  mapReady(event: any) {
    this.map = event;
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('searchBox'));
    this.map.controls[google.maps.ControlPosition.LEFT_CENTER].push(document.getElementById('menuComponent'));
  }

  displayMenu() {
    console.log(this.map.controls[google.maps.ControlPosition.LEFT_CENTER]['j'].length)
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

  /** Use Google maps to search for specific address on the map
   *  If found the address save the loction to the json service to look around it
   */
  searchAddress() {
    this.myLocationMarker = null;
    this.flaskService.getAddress(this.address).subscribe((data) => {
      console.log("data:");
      console.log(data)
      if (data['status'] != 'OK') {
        console.error("There was error retriving the address")
      } else {
        console.log(data)
        this.info = data['results'][0]['formatted_address']
        // get the lat and lng
        var location = data['results'][0]['geometry']['location']
        console.log("location:")
        console.log(location)
        this.lat = location.lat
        this.lng = location.lng
        this.zoom = 14;
        this.jsonService.myLocationMarker = { "lat": this.lat, "lng": this.lng };
      }
    })
  }
}

