import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { GoogleMapsComponent } from './google-maps/google-maps.component';
import { LoginComponent } from './login/login.component'

//This is my case 
const routes: Routes = [
    {
        path: '',
        component: AppComponent
    },
    {
        path: 'google',
        component: GoogleMapsComponent
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }