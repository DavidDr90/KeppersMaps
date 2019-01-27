import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { TranslateService } from '../services/translate.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { IMyDrpOptions, IMyDateRangeModel } from 'mydaterangepicker';
import { JsonService } from '../services/json.service';
import { } from 'events';
import { HttpClient } from '@angular/common/http';
import { FlaskService } from '../services/flask.service';

// for loading spinner
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';



declare var require: any;
// For working with Date and Time
// https://momentjs.com/
var moment = require('moment');



@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {

  @Output() event: EventEmitter<any> = new EventEmitter<any>();

  filterObject = {
    "startDate": null,
    "endDate": null,
    "filterBy": {
      "isHeavy": false,
      "isMedium": false,
      "isEasy": false
    }
  }


  levels = new FormControl();

  choosenDate;

  langs = ["EN", "IT", "HE"];

  sexs = [
    { name: "MALE", checked: false },
    { name: "FEMALE", checked: false }
  ];

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

  constructor(private translate: TranslateService, private _formBuilder: FormBuilder,
    private jsonService: JsonService, private flaskService: FlaskService,
    private spinnerService: Ng4LoadingSpinnerService) {
    // this.flaskService.initMap().subscribe((data) => {
    //   console.log("in ngOnInit!")
    //   console.log(data)
    // })
    // save the date of yesterday and set the datepicker rang
    let today = new Date();
    today.setDate(today.getDate())// - 1);
    let obj = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() - 1 }
    this.yesterday = {
      beginDate: obj,
      endDate: obj
    }
    this.choosenDate = this.yesterday;

    this.filterObject.startDate = moment().subtract(1, 'days');
    this.filterObject.endDate = moment().subtract(1, 'days');
  }

  ngOnInit() {

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


  /** change the checked value when the checkbox is change
   * @param sex the clicked sex checkbox
   */
  onChange(input: string, isGender: boolean) {
    /*var item;
    var control;
    if (isGender) {
      item = this.sexs.find(x => x.name == input);
      // control = 'gender';
      // this._myForm.controls[control].setValue(this.sexs);
    } else {
      item = this.severityLevels.find(x => x.name == input);
      // control = 'severityLevels';
      // this._myForm.controls[control].setValue(this.severityLevels);
    }
    item.checked = !item.checked;*/

  }


  myDateRangePickerOptions: IMyDrpOptions = {
    showClearBtn: true,
    showApplyBtn: true,
    dateFormat: this.dateFormat,
    firstDayOfWeek: "su",
    markCurrentDay: true,
    showClearDateRangeBtn: true,
  };

  // 

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
      console.log("you cannot choose dates in the future!")
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
    this.flaskService.getMap().subscribe(
      // on seccues
      (data) => {
        console.log("in filter!")
        console.log(data)
        this.spinnerService.hide()
      },
      // on error
      (err) => {
        console.log("there was error!")
        console.log(err)
        this.spinnerService.hide()
      })
    this.showMap = true
  }

  heatMapChecked = false;
  heatMapDisabled = false;
}
