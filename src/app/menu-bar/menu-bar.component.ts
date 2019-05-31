import { Component } from '@angular/core';
import { TranslateService } from '../services/translate.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IMyDrpOptions, IMyDateRangeModel } from 'mydaterangepicker';
import { JsonService } from '../services/json.service';
import { } from 'events';
import { FlaskService } from '../services/flask.service';
import { MatSnackBar } from '@angular/material';

// for loading spinner
import { NgxSpinnerService } from 'ngx-spinner';
// for two range slider
import { Options } from 'ng5-slider';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';


declare var require: any;
// For working with Date and Time
// https://momentjs.com/
var moment = require('moment');


const MIN_AGE = 5, MAX_AGE = 17;

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent {

  // for the filter arguments
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

  // for the languages switchers
  langs = ["EN", "IT", "HE"];

  // for the date picker
  dateFormat = 'dd.mm.yyyy';
  yesterdayMoment: any;
  yesterday: {
    year: any;
    month: any; //months start in 0
    day: any;
  };
  myForm: FormGroup;

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


  constructor(private translate: TranslateService, private formBuilder: FormBuilder,
    private jsonService: JsonService, private flaskService: FlaskService,
    private spinner: NgxSpinnerService, private snackBar: MatSnackBar,
    private authService: AuthService) {
    // save the date of yesterday and set the datepicker rang
    this.yesterdayMoment = moment().subtract(1, 'days');
    this.yesterday = {
      year: this.yesterdayMoment.year(),
      month: this.yesterdayMoment.month() + 1,//months start in 0
      day: this.yesterdayMoment.date()
    }

    // save the date to the filter object
    this.filterObject.startDate = this.yesterdayMoment;
    this.filterObject.endDate = this.yesterdayMoment;
  }

  ngOnInit() {
    // set the datepicker to yesterday
    this.myForm = this.formBuilder.group({
      myDateRange: [
        {
          beginDate: this.yesterday,
          endDate: this.yesterday
        },
        Validators.required]
    });
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

  /** NOT IN USE!
   *  change the display language to the input on
   *  if the lang is 'he' change all the display to be RTL
   *  else keep the dispaly LTR
   * @param lang language to change to
   */
  setLang(lang: string) {
    lang = lang.toLowerCase();//for the JSON files
    // change the display to RTL
    if (lang !== 'he' && document.getElementsByTagName('html')[0].hasAttribute('dir')) {
      document.getElementsByTagName('html')[0].removeAttribute('dir');
    } else if (lang === 'he' && !document.getElementsByTagName('html')[0].hasAttribute('dir')) {
      document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
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

  /** date picker object
  *  should be in the next format:
  *  yesterday: {
  *        beginDate: { year: number; month: number; day: number; };
  *        endDate: { year: number; month: number; day: number; };
  *  };
  *  */

  /** dateRangeChanged callback function called when the user apply the date range.
   *  this fucntion check if the input date is valid (not greader then today)
   *  and save the new start and end dates to the filter object
   * @param event event properties are: event.beginDate, event.endDate, event.formatted, event.beginEpoc and event.endEpoc
   */
  onDateRangeChanged(event: IMyDateRangeModel) {
    let start = moment().year(event.beginDate.year).month(event.beginDate.month - 1).date(event.beginDate.day);
    let end = moment().year(event.endDate.year).month(event.endDate.month - 1).date(event.endDate.day);
    let today = moment();
    if ((start >= today) || (end >= today)) {
      let msg = "You cannot choose dates in the future"
      console.error(msg)
      this.openUserErrorToast(msg)
      // change the datapicker display back to yesterday
      this.setDateRangeToYesterday()
    } else {
      this.filterObject.startDate = start;
      this.filterObject.endDate = end;
    }
  }

  /** Set the DatePicker to yesterday date
   */
  setDateRangeToYesterday(): void {
    // Set the datepicker to yesterday 
    this.myForm.setValue({
      myDateRange: {
        beginDate: this.yesterday,
        endDate: this.yesterday
      }
    });
  }



  /** Main method
   *  Save all the parameters to the filter object
   *  Post the filter object to the flask server
   *  Then recive the json data back from the flask server
   */
  filter() {
    let t0, t1

    // save the address location in lat and lng 
    if ((this.jsonService.myLocationMarker === null) || (this.jsonService.myLocationMarker === undefined)) {
      let msg = "Please choose a location on the map to search in"
      console.error(msg)
      this.openUserErrorToast(msg)
      return
    }

    // begin time
    t0 = performance.now();

    // save the severity levels to the filter object
    if (!this.saveSeverityToFilterObject(this.selectedItems)){
      this.openUserErrorToast("Please choose at least one severity level")
      return
    }

    this.saveAgeToFilterObject();
    // save only the date for processing the Keepers information
    this.saveDateToFilterObject();
    // save the center search location
    this.filterObject.centerLocaion = this.jsonService.myLocationMarker;

    this.spinner.show();


    // send the parameters to the server
    this.flaskService.sendParameters(this.filterObject).pipe(
      // this occurs in any case after the subscribe is over
      finalize(() => {
        // end time
        t1 = performance.now();
        let msg = "Finalize time: " + Number((t1 - t0) / 1000).toFixed(2) + " seconds.";
        console.info(msg)
      })
    ).subscribe(
      () => {
        // after the parameters posted to the server create a map
        this.flaskService.getMap().subscribe(
          // on seccues
          (data: Object) => {
            this.jsonService.setUserData(data)
            this.spinner.hide()
            // end time
            t1 = performance.now();
            let msg = "Call to the server took " + Number((t1 - t0) / 1000).toFixed(2) + " seconds.";
            this.openUserInfoToast(msg)
          },
          // on error
          (error) => {
            let msg = "There was an error while trying to recive info from the server.";
            console.error(msg)
            console.error(error)
            this.spinner.hide()
            this.openUserErrorToast(msg + " Description: " + error.message)
          })
      }, (error) => {
        let msg = "There was an error while posting filter object to the server."
        console.error(msg)
        console.error(error)
        this.spinner.hide()
        this.openUserErrorToast(msg + " Description: " + error.message)
      })

    this.resetFilterBy()

  }

  /** Reset the age slider 
   *  save user's age range pick
   */
  saveAgeToFilterObject() {
    // reset the age slider for the next time
    // this.sliderForm.reset({ sliderControl: [MIN_AGE, MAX_AGE] });
    // save the age range to the filter object
    this.filterObject.age.start = this.minAge;
    this.filterObject.age.end = this.maxAge;
  }

  /** Save the date to the filter object
   */
  saveDateToFilterObject() {
    if (typeof (this.filterObject.startDate) !== "string") {
      this.filterObject.startDate = (moment.isMoment(this.filterObject.startDate)) ?
        this.filterObject.startDate.format('DD/MM/YYYY') : this.yesterdayMoment.format('DD/MM/YYYY');
    }
    if (typeof (this.filterObject.endDate) !== "string") {
      this.filterObject.endDate = (moment.isMoment(this.filterObject.endDate)) ?
        this.filterObject.endDate.format('DD/MM/YYYY') : this.yesterdayMoment.format('DD/MM/YYYY');
    }
  }

  /** Save the filterBy parameters from the dropdown
   */
  saveSeverityToFilterObject(selectedItems: any): any {
    if (!this.arrayNotEmpty(selectedItems)) {
      return false
    }
    selectedItems.forEach(element => {
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
    return true

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

  /** Display toast to the user
   * @param message 
   * @param action 
   */
  openUserErrorToast(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
      verticalPosition: "bottom",
      horizontalPosition: "right",
      politeness: "polite",
    });
  }

  /** Display toast to the user
   * @param message 
   * @param action 
   */
  openUserInfoToast(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 2500,
      verticalPosition: "top",
      horizontalPosition: "right",
      politeness: "polite",
    });
  }

  signOut() {
    this.authService.SignOut()
  }
}
