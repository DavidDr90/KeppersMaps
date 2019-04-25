import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { MapsAPILoader } from '@agm/core';
import { Marker, Subjects } from "../marker";
import { Subject } from 'rxjs/internal/Subject';


// For parsing the JSON file efficiently we use 
// http://oboejs.com/
declare var require: any;
var oboe = require('oboe');

// For work efficeint with collection of data
// https://lodash.com/
// Load the full build.
var _ = require('lodash');

// For working with Date and Time
// https://momentjs.com/
var moment = require('moment');

const STRENGTH_LEVELS = {
  "HEAVY": "heavy",
  "MEDIUM": "medium",
  "EASY": "easy"
}


@Injectable({
  providedIn: 'root'
})
export class JsonService {

  myBool$: any;
  data$: any;

  private boolSubject = new Subject<boolean>();
  private userData = new Subject<any>();
  myLocationMarker: { lat: any; lng: any; };


  constructor(private http: HttpClient, private mapsAPILoader: MapsAPILoader) {
    // this.userData = {};
    this.myBool$ = this.boolSubject.asObservable()
    this.data$ = this.userData.asObservable();

  }

  setUserData(val: object) {
    this.userData.next(val);
  }

  getUserData() {
    return this.userData;
  }



  /*************************    Old Service *********************/

  lat: any;
  lng: any;
  dataObject = {
    "start_date": moment(),
    "end_date": moment(),
    "heavy": [],
    "medium": [],
    "easy": [],
    "toString": function () {
      let heavyStr = "", mediumStr = "", easyStr = "";
      let i = 0;
      if (this.heavy !== null)
        this.heavy.forEach(element => {
          heavyStr += "\n[" + i + "] \n\t" + "lat: " + element.latitude + "\n\tlng: " + element.longitude;
          i++;
        });
      i = 0;
      if (this.medium !== null)
        this.medium.forEach(element => {
          mediumStr += "\n[" + i + "]\n\t" + "lat: " + element.latitude + "\n\tlng: " + element.longitude;
          i++;
        });
      i = 0;
      if (this.easy !== null)
        this.easy.forEach(element => {
          easyStr += "\n[" + i + "]\n\t" + "lat: " + element.latitude + "\n\tlng: " + element.longitude;
          i++;
        });
      return "****************\n" + "date: " + this.start_date + " - " + this.end_date + "\n"
        + "Heavy: " + heavyStr + "\n"
        + "Medium: " + mediumStr + "\n"
        + "Easy: " + easyStr + "\n"
        + "****************"
    }
  }

  filterObject: { "startDate": any; "endDate": any; "filterBy": { "isHeavy": boolean; "isMedium": boolean; "isEasy": boolean; }; };

  // constructor(private http: HttpClient, private mapsAPILoader: MapsAPILoader) {
  // }

  /** get the data from the JSON file the slow way
  *  using a http request, saving the whole file to local memory
  *  and then process the objects one by one
  */

  getJSONFile() {
    return this.http.get('./assets/MockJSON/ConverstionSeverity.json')
      .pipe(map((response: any) => response));
  }

  getDate() {
    return new Promise((resolve, reject) => {
      this.getJSONFile().subscribe((data) => {
        let high: Marker[] = [];
        data.forEach(element => {
          if (element.strength === STRENGTH_LEVELS.EASY)
            high.push({
              name: element.child_id,
              description: element.created_date,
              strength: element.strength
            })
        });
        resolve(high);
      })
    });
  }

  /** create locations array from the Json file 
   * @returns a Promise with an array of locations from the json file
   */
  getLocations(): Promise<Marker[]> {
    return new Promise((resolve, reject) => {
      try {
        this.getJSONFile().subscribe(
          (data) => {
            let locations: Marker[] = [];
            data.forEach(element => {
              locations.push({
                name: element.child_id,
                lat: element.latitude,
                lng: element.longitude,
                description: element.date_created,
              })
            });
            // locations = locations.splice(0, 80000);
            // remove elemntes with the same lat and lng
            locations = this.removeDuplicateLocations(locations);
            console.log("before resolve");
            console.log(locations)
            resolve(locations);
          });
      } catch (error) {
        reject(error);
      }
    });
  }


  /******** The Fast Way ***************/

  /** Loading JSON trees larger than the available RAM
   *  We are streaming large resources to avoid memory limitations,
   *  so we delete any detected and proccessed node by returning 'oboe.drop' from the node event.
   *  @param path - a full path to the JSON file we want to process
   *  @returns a Promise object with the process data from the JSON file
   */
  getDataFromServer(): Promise<any> {

    let strArr = ["heavy", "medium", "easy"];//TODO:remove after getting the API

    //TODO: here we should use the Keepers REST API with the start and end dates to get the data from the server.
    let path = './assets/MockJSON/ChildLocation - short.json';
    return new Promise((resolve, reject) => {
      console.time("get data")

      oboe(path)//should be a JSON file pointer
        .node('!.*', (obj) => {
          // switch (obj.strength) {
          switch (strArr[Math.floor(Math.random() * 3)]) {
            case STRENGTH_LEVELS.HEAVY:
              // if (!this.checkForDublicate(this.dataObject.heavy, obj))
              this.dataObject.heavy.push(obj);
              break;
            case STRENGTH_LEVELS.MEDIUM:
              // if (!this.checkForDublicate(this.dataObject.medium, obj))
              this.dataObject.medium.push(obj);
              break;
            case STRENGTH_LEVELS.EASY:
              // if (!this.checkForDublicate(this.dataObject.easy, obj))
              this.dataObject.easy.push(obj);
              break;
          }

          // By returning oboe.drop, the parsed JSON object will be freed,
          // allowing it to be garbage collected.
          return oboe.drop;

        })
        .done((leftover) => {// we got it
          console.timeEnd("get data")
          resolve({ "data": this.dataObject, "leftover": leftover });
        })
        .fail(function (error) {// we don't got it
          reject(error)
        });
    });
  }

  /** check for duplicate entries in the JSON file
   *  check if the lat and lng are eqaul
   *  check if the child_id is equal
   *  check if the date and the hour is equal
   * @param array the local markers array
   * @param obj the candidate to enter the local array
   * @returns true if there is already an entry with the same values in the local array
   */
  private checkForDublicate(array: any[], obj: any): boolean {
    return _.some(array, (value) => {
      let objDate = moment(value.date_created, "YYYY-MM-DD HH:mm:ss");
      let othDate = moment(obj.date_created, "YYYY-MM-DD HH:mm:ss");
      return (
        (obj.longitude === value.longitude) &&
        (obj.latitude === value.latitude) &&
        (obj.child_id == value.child_id) &&
        (othDate.get('date') === objDate.get('date')) &&
        (othDate.get('hour') === objDate.get('hour'))
      )
    });
  }

  /****** Private Methods  *************/

  /** remove duplicate marker objects with the same lat and lng from the markers array
   * @param markers an array of marker objects
   * @returns new array of marker object without duplicate locations values
   */
  private removeDuplicateLocations(markers: Marker[]): Marker[] {
    return markers.filter((elem, index, self) => self.findIndex(
      (t) => { return (t.lat === elem.lat && t.lng === elem.lng) }) === index)
  }

  removeDup(array) {
    let newArr = array.filter((elem, index, self) => _.findIndex(self,
      (t) => { return _.isEqualWith(t, elem, this.customizer) }) === index);
    console.log("newArr:");
    console.log(newArr);
    return newArr;
  }

  customizer(objValue, othValue) {
    let objDate = moment(objValue.date_created, "YYYY-MM-DD HH:mm:ss");
    let othDate = moment(othValue.date_created, "YYYY-MM-DD HH:mm:ss");

    if (
      (objValue.longitude === othValue.longitude) &&
      (objValue.latitude === othValue.latitude) &&
      (objValue.child_id == othValue.child_id) &&
      (objDate.get('date') === othDate.get('date')) &&
      (objDate.get('hour') === othDate.get('hour'))
    )
      return true;
  }

  filter(complexData, borders, filterBy) {
    if ((complexData === undefined) || (complexData === null))
      return;

    /** TODO: the basic filter is working fine with array up to 500K 
     * need to find another solution, maybe filter combine with some... 
     * use the guide here: 
     * https://hackernoon.com/searching-data-structures-with-javascript-enter-map-reduce-and-then-some-d-50782bd36b8b
     *
     * another Data Structures for search in JS to check:
     *  Object - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
     *  Map
     *  WeakMap
     *  Set
     *  WeakSet
     *  Hash Table - https://medium.com/@yanganif/javascript-hash-table-8878afceecbc
     * 
     *  Or even use Pipe:
     *  https://stackoverflow.com/questions/40678206/angular-2-filter-search-list
     * 
     *  Object vs Array:
     *  https://scotch.io/courses/10-need-to-know-javascript-concepts/data-structures-objects-and-arrays
     * 
     * 
     *  See also:
     *  https://github.com/jashkenas/underscore
     *  https://www.andygup.net/fastest-way-to-find-an-item-in-a-javascript-array/
     *  */

    /**
    * Filter filters out array members for which callback returns true,
    * so, we touch the box using .some() and see if it has 
    * stuff that we are looking for inside (some returns true with callback that returns true)
    **/
    return _.filter(complexData[filterBy], function (item) {
      return (
        (item.longitude <= borders.NorthEast.lng) && (item.longitude >= borders.SouthWest.lng)
        &&
        (item.latitude <= borders.NorthEast.lat) && (item.latitude >= borders.SouthWest.lat)
      )
    })

    /*complexData[filterBy].filter((item) => {
      // return item.markers.some((marker) => {
      // return item.some((marker) => {
      return (
        (item.longitude <= borders.NorthEast.lng) && (item.longitude >= borders.SouthWest.lng)
        &&
        (item.latitude <= borders.NorthEast.lat) && (item.latitude >= borders.SouthWest.lat)
      )
    });
  
    // (item.filterBy.longitude <= borders.NorthEast.lng) && (item.longitude >= borders.SouthWest.lng)
    // &&
    // (item.latitude <= borders.NorthEast.lat) && (item.latitude >= borders.SouthWest.lat)
    // })
    /**
    * Now we have all the boxes that have character we are looking for 
    * in any of issues inside.
    *
    * Next we map through the boxes that we found contain some issues
    * we are looking for.
    **/
    // .map((box) => {
    /**
    * inside of a box, we are mapping through issues returning
    * array of addresses inside of our big collection,
    * with any other needed info
    */
    // return box.issues.map((issue) => {
    //   return {
    //     box: box.universe,
    //     id: issue.id,
    //     characters: issue.characters
    //   };
    // })
    /**
    * we filter these by character appearance
    * and that is what gets returned per box
    * (array of locations of issues with character appearance in this particular box)
    */
    //     .filter((issue) => {
    //       return (
    //         (issue.characters.indexOf(searchForLat) !== -1)
    //         &&
    //         (issue.characters.indexOf(searchForLng) !== -1)
    //       )
    //     });
    // })
    /**
    * Result is array of arrays of graphic novels with character we are looking for
    * We then reduce these to single array containing them all.
    * 
    * And those are our search results
    **/
    // .reduce((a, b) => a.concat(b));
  }


  /** save the new filter object locally on the service
   *  set the start and end date in the date object
   * @param filterObject the new filter object
   */
  setFilterObject(filterObject: { "startDate": any; "endDate": any; "filterBy": { "isHeavy": boolean; "isMedium": boolean; "isEasy": boolean; }; }): Promise<boolean> {

    this.filterObject = filterObject;
    if ((this.dataObject.start_date !== filterObject.startDate)
      && (this.dataObject.end_date !== filterObject.endDate)) {
      this.dataObject.start_date = filterObject.startDate;
      this.dataObject.end_date = filterObject.endDate;
      //get a new data from the server
      return this.getDataFromServer();
    }
    else {
      console.log("else");
    }
  }

}

