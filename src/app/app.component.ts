import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { TranslateService } from './services/translate.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // for the languages switchers
  langs = ["EN", "IT"];


  constructor(public router: Router, public authService: AuthService,
    private translate: TranslateService) { }

  ngOnInit() {
    // check if the user already signin
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/main')
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  signOut() {
    this.authService.SignOut();
    this.router.navigateByUrl('/login');
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
    } else if (lang === 'he' && !document.getElementsByTagName('html')[0].hasAttribute('dir')) {
      document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
    }
    this.translate.use(lang);
  }
}
