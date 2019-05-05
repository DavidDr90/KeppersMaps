import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module'; // Added here

// for loading spinner
import { NgxSpinnerModule } from 'ngx-spinner';
// for the two range slider
import { Ng5SliderModule } from 'ng5-slider';
// for the dropdown checkbox
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
// for login
import { AngularFireModule } from "angularfire2"
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBo0oh2Lk43AKf8Chvvu27y6PFXjmPx5vM",
  authDomain: "keepersmaps.firebaseapp.com",
  databaseURL: "https://keepersmaps.firebaseio.com",
  projectId: "keepersmaps",
  storageBucket: "keepersmaps.appspot.com",
  messagingSenderId: "997437409187",
  appId: "1:997437409187:web:25960082a8566fcf"
};

// For Google Maps
// using the next github and npm packge
// https://angular-maps.com/guides/getting-started/
// https://github.com/SebastianM/angular-google-maps
// https://github.com/atmist/snazzy-info-window
import { AgmCoreModule } from '@agm/core';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';


// My Components
import { AppComponent } from './app.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { GoogleMapsComponent } from './google-maps/google-maps.component';
import { LoginComponent } from './login/login.component'
// for the translate servie
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from './services/translate.service';
import { TranslatePipe } from './services/translate.pipe';

// for Google Materials
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule, MatCheckboxModule, MatListModule, MatIconModule,
  MatLineModule, MatFormFieldModule, MatInputModule, MatDatepickerModule,
  MatNativeDateModule, MatSliderModule, MatToolbarModule, MatCardModule,
  MatSelectModule, MatSlideToggleModule, MatSnackBarModule, MatDialogModule
} from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

// for flex layout
import { FlexLayoutModule } from '@angular/flex-layout';

// for custom datepicker
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { JsonService } from './services/json.service';
import { AuthService } from './services/auth.service';
import { MainComponent } from './main/main.component';
import { Routes, RouterModule } from '@angular/router';
// datepicker with rang: https://github.com/kekeh/mydaterangepicker

// make sure the display start as English
export function setupTranslateFactory(
  service: TranslateService): Function {
  return () => service.use('en');
}

const MY_API_KEY_FOR_GOOGLE_MAPS = 'AIzaSyDqvULxK5r9Yw1-a8gDYLJITEcgKfhp1X8';

@NgModule({
  declarations: [
    AppComponent,
    TranslatePipe,
    GoogleMapsComponent,
    MenuBarComponent,
    LoginComponent,
    MainComponent
  ],
  imports: [
    RouterModule.forRoot(
      [
        {
          path: 'login',
          component: LoginComponent
        },
        {
          path: "main",
          component: MainComponent
        }
      ],
      // { enableTracing: true } // TODO <-- debugging purposes only
    ),
    AppRoutingModule,
    // for login
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    // for loading spinner
    NgxSpinnerModule,
    // for range slider
    Ng5SliderModule,
    // dropdown check box
    NgMultiSelectDropDownModule.forRoot(),
    // for google maps
    AgmCoreModule.forRoot({
      apiKey: MY_API_KEY_FOR_GOOGLE_MAPS,
      libraries: ['geometry']
    }),
    AgmSnazzyInfoWindowModule,
    AgmJsMarkerClustererModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    // for the translate service
    HttpClientModule,
    // for flex layout
    FlexLayoutModule,
    // for custom datepicker
    MyDateRangePickerModule,
    // for the Google Materials
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    MatIconModule,
    MatLineModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatSliderModule,
    MatToolbarModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSnackBarModule,


  ],
  providers: [
    AuthService,
    TranslateService,
    JsonService,
    {
      provide: APP_INITIALIZER,
      useFactory: setupTranslateFactory,
      deps: [TranslateService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
