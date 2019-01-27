import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// for loading spinner
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';


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
  MatSelectModule
} from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

// for flex layout
import { FlexLayoutModule } from '@angular/flex-layout';

// for custom datepicker
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { JsonService } from './services/json.service';
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
    MenuBarComponent
  ],
  imports: [
    // for loading spinner
    Ng4LoadingSpinnerModule.forRoot(),
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
    MatSelectModule


  ],
  providers: [
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
