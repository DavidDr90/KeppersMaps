import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { TranslateService } from '../services/translate.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IMyDrpOptions, IMyDateRangeModel } from 'mydaterangepicker';
import { JsonService } from '../services/json.service';
import { } from 'events';
import { FlaskService } from '../services/flask.service';

// for loading spinner
import { NgxSpinnerService } from 'ngx-spinner';
// for two range slider
import { Options } from 'ng5-slider';

import { ErrorStateMatcher } from '@angular/material/core';
import { FormGroupDirective, NgForm, Validators } from '@angular/forms';
// import {} from '@types/googlemaps'
import { Observable } from 'rxjs';
import { resolve } from 'url';

declare var require: any;
// For working with Date and Time
// https://momentjs.com/
var moment = require('moment');

declare var google: any;

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

const DEFUALT_LATITUDE = 51.5074, DEFUALT_LONGITUDE = 0.1278;//London UK
const MIN_AGE = 5, MAX_AGE = 17;

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent {

  @Output() event: EventEmitter<any> = new EventEmitter<any>();

  matcher = new MyErrorStateMatcher();

  filterObject = {
    "startDate": null,
    "endDate": null,
    "filterBy": {
      "isHeavy": false,
      "isMedium": false,
      "isEasy": false
    },
    "centerLocaion": null,
    "age": {
      "start": MIN_AGE,
      "end": MAX_AGE
    }
  }

  // for the Severity levels dropdown
  selectedItems;
  dropdownList = [
    { item_id: 1, item_text: 'High' },
    { item_id: 2, item_text: 'Medium' },
    { item_id: 3, item_text: 'Low' }
  ];
  dropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
  };

  levels = new FormControl();

  choosenDate;

  langs = ["EN", "IT", "HE"];

  

  yesterday: {
    beginDate: { year: number; month: number; day: number; };
    endDate: { year: number; month: number; day: number; };
  };

  dateFormat = 'dd.mm.yyyy';
  showMap: boolean = false;

  // slider init
  minAge: number = MIN_AGE;
  maxAge: number = MAX_AGE;
  sliderForm: FormGroup = new FormGroup({
    sliderControl: new FormControl([MIN_AGE, MAX_AGE])
  });
  options: Options = {
    floor: 5,
    ceil: 17,
    step: 1
  };

  constructor(private translate: TranslateService, private _formBuilder: FormBuilder,
    private jsonService: JsonService, private flaskService: FlaskService,
    private spinner: NgxSpinnerService) {
    // save the date of yesterday and set the datepicker rang
    let today = new Date();
    today.setDate(today.getDate())// - 1);
    let obj = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() - 1 }
    this.yesterday = {
      beginDate: obj,
      endDate: obj
    }
    this.choosenDate = this.yesterday;
    // save the date to the filter object
    this.filterObject.startDate = moment().subtract(1, 'days');
    this.filterObject.endDate = moment().subtract(1, 'days');
  }

  /** NOT IN USE!!! 
   *  Send the input address to GoogleMaps server
   *  Retrive the lat and lng of the input address
   *  If there was error display it to the user
   *  If the user did not enter any address the defualt address is:
   *  'Rome italy'
   *  @returns Promise, resolve - return the lcoation, reject - return error message
   */
  private convertAddressToLocation(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.flaskService.getAddress("").subscribe((data) => {
        if (data['status'] != 'OK') {
          console.error("There was error retriving the address")
          reject("There was error retriving the address")
        } else {
          // get the lat and lng
          var location = data['results'][0]['geometry']['location']
          // save the lat and lng to the filter object to send to the FlaskServer
          resolve(location)
        }
      })
    })
  }

  /** change the display language to the input on
   *  if the lang is 'he' change all the display to be RTL
   *  else keep the dispaly LTR
   * @param lang language to change to
   */
  setLang(lang: string) {
    lang = lang.toLowerCase();//for the JSON files
    // change the display to RTL
    if (lang !== 'he' && document.getElementsByTagName('html')[0].hasAttribute('dir')) {
      document.getElementsByTagName('html')[0].removeAttribute('dir');
      this.dateFormat = "mm.dd.yyyy";//TODO: change the format when change te lang
    } else if (lang === 'he' && !document.getElementsByTagName('html')[0].hasAttribute('dir')) {
      document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
      this.dateFormat = "dd.mm.yyyy";
    }
    this.translate.use(lang);
  }

  myDateRangePickerOptions: IMyDrpOptions = {
    showClearBtn: true,
    showApplyBtn: true,
    dateFormat: this.dateFormat,
    firstDayOfWeek: "su",
    markCurrentDay: true,
    showClearDateRangeBtn: true,
  };

  /** dateRangeChanged callback function called when the user apply the date range.
   *  this fucntion check if the input date is valid (not greader then today)
   *  and save the new start and end dates to the filter object
   * @param event event properties are: event.beginDate, event.endDate, event.formatted, event.beginEpoc and event.endEpoc
   */
  onDateRangeChanged(event: IMyDateRangeModel) {
    let start = moment().year(event.beginDate.year).month(event.beginDate.month - 1).date(event.beginDate.day);
    let end = moment().year(event.endDate.year).month(event.endDate.month - 1).date(event.endDate.day);
    let today = moment();
    if ((start >= today) || (end >= today))
      //TODO: make an error message to the user!
      console.error("you cannot choose dates in the future!")
    else {
      this.filterObject.startDate = start;
      this.filterObject.endDate = end;
    }
  }

  filter() {
    this.saveFilterBy(this.selectedItems)
    this.sliderForm.reset({ sliderControl: [MIN_AGE, MAX_AGE] });
    this.spinner.show()
    // save the age range to the filter object
    this.filterObject.age.start = this.minAge;
    this.filterObject.age.end = this.maxAge;
    // save the address location in lat and lng 
    this.filterObject.centerLocaion = (this.jsonService.myLocationMarker != null) ?
      this.jsonService.myLocationMarker : { lat: DEFUALT_LATITUDE, lng: DEFUALT_LONGITUDE };
    // save only the date for processing the Keepers information
    if (moment.isMoment(this.filterObject.startDate))
      this.filterObject.startDate = this.filterObject.startDate.format('DD/MM/YYYY');
    if (moment.isMoment(this.filterObject.endDate))
      this.filterObject.endDate = this.filterObject.endDate.format('DD/MM/YYYY');
    // send the parameters to the server
    this.flaskService.sendParameters(this.filterObject).subscribe(
      () => {
        // after the parameters posted to the server create a map
        this.flaskService.getMap().subscribe(
          // on seccues
          (data: Object) => {
            console.log("in filter!")
            console.log(data)
            this.jsonService.setUserData(data)
            this.spinner.hide()
          },
          // on error
          (err) => {
            console.log("there was error!")
            console.log(err)
            this.spinner.hide()

          })
        this.showMap = true
      }, (error) => {
        console.error(error)
      })
    this.resetFilterBy()
  }

  /** Save the filterBy parameters from the dropdown
   */
  saveFilterBy(selectedItems: any): any {
    if (!this.arrayNotEmpty(selectedItems)) {
      return
    }
    selectedItems.forEach(element => {
      console.log(element)
      switch (element.item_id) {
        case 1:
          this.filterObject.filterBy.isHeavy = true
          break;
        case 2:
          this.filterObject.filterBy.isMedium = true
          break;
        case 3:
          this.filterObject.filterBy.isEasy = true
          break;
        default:
          break;
      }
    });

  }

  /** Reset the filterBy object to false 
   */
  resetFilterBy() {
    // run over the filterBy object
    for (var key in this.filterObject.filterBy) {
      this.filterObject.filterBy[key] = false
    }
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
