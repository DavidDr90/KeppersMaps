import { Component, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '../services/translate.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { IMyDrpOptions, IMyDateRangeModel } from 'mydaterangepicker';
import { JsonService } from '../services/json.service';
import { } from 'events';
import { FlaskService } from '../services/flask.service';

// for loading spinner
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
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


@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent {

  @Output() event: EventEmitter<any> = new EventEmitter<any>();

  address;

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
      "start": 0,
      "end": 0
    }
  }

  levels = new FormControl();

  choosenDate;

  langs = ["EN", "IT", "HE"];

  severityLevels = [
    { displayName: "HIGH", is: "isHeavy" },
    { displayName: "MEDIUM", is: "isMedium" },
    { displayName: "LOW", is: "isEasy" },
  ];

  yesterday: {
    beginDate: { year: number; month: number; day: number; };
    endDate: { year: number; month: number; day: number; };
  };

  dateFormat = 'dd.mm.yyyy';
  showMap: boolean = false;
  startAge;
  endAge;
  constructor(private translate: TranslateService, private _formBuilder: FormBuilder,
    private jsonService: JsonService, private flaskService: FlaskService,
    private spinnerService: Ng4LoadingSpinnerService) {
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


  /** Send the input address to GoogleMaps server
   *  Retrive the lat and lng of the input address
   *  If there was error display it to the user
   *  If the user did not enter any address the defualt address is:
   *  'Rome italy'
   *  @returns Promise, resolve - return the lcoation, reject - return error message
   */
  private convertAddressToLocation(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.flaskService.getAddress(this.address).subscribe((data) => {
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
      this.invert = false;
      this.dateFormat = "mm.dd.yyyy";//TODO: change the format when change te lang
    } else if (lang === 'he' && !document.getElementsByTagName('html')[0].hasAttribute('dir')) {
      document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
      this.invert = true;
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

  // variable for the age slider element
  // TODO: make some const for the min max and steps, ask Doron for that.
  disabled: boolean;
  thumbLabel: boolean = true;
  invert: boolean;
  min: number = 6;
  max: number = 17;
  step: number = 1;
  ageSliderValue: number;

  onSliderChange() {
    console.log(this.ageSliderValue);
  }


  filter() {
    this.spinnerService.show();
    // save the age range to the filter object
    this.filterObject.age.start = (this.startAge > 0) ? this.startAge : 5;
    this.filterObject.age.end = (this.endAge > 0) ? this.endAge : 5;
    // get the address and convert it to location
    this.convertAddressToLocation().then((data) => {
      // save the address location in lat and lng 
      this.filterObject.centerLocaion = data;
      // save only the date for processing the Keepers information
      if (moment.isMoment(this.filterObject.startDate))
        this.filterObject.startDate = this.filterObject.startDate.format('DD/MM/YYYY');
      if (moment.isMoment(this.filterObject.endDate))
        this.filterObject.endDate = this.filterObject.endDate.format('DD/MM/YYYY');
      // send the parameters to the server
      this.flaskService.sendParameters(this.filterObject).subscribe(
        (data) => {
          // after the parameters posted to the server create a map
          this.flaskService.getMap().subscribe(
            // on seccues
            (data: Object) => {
              console.log("in filter!")
              console.log(data)
              this.jsonService.setUserData(data)
              this.spinnerService.hide()
            },
            // on error
            (err) => {
              console.log("there was error!")
              console.log(err)
              this.spinnerService.hide()
            })
          this.showMap = true
        }, (error) => {
          console.error(error)
        })
    }).catch((error) => {
      console.error(error)
    })
  }

}
