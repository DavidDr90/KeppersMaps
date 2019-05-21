import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isValid: boolean = false;

  constructor(public authService: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit() { }

  login(userName: string, userPassword: string) {
    this.authService.SignIn(userName, userPassword)
      .then((data) => {
        this.router.navigateByUrl('/main');
      }).catch((error) => {
        // get the error message using the error code
        let msg = this.authService.convertErrorMessage(error['code'])
        console.error(msg)
        // display the message to the user
        this.openErrorToast(msg, "Close")
      })
  }


  /** Fire when the user leave the email input filed
   * @param userEmail 
   */
  onChange(userEmail: string) {
    this.isValid = this.validateEmail(userEmail)
  }


  /** Check if a given string is valid email
   * @param email - string to check
   */
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }


  /** Handle function for rest password
   *  this function uses the email from the email input field
   * @param userName - the email to rest the password
   */
  forgotPassword(userName: string) {
    this.authService.ForgotPassword(userName)
      .then((msg: string) => {
        this.openInfoToast(msg, "OK")
      })
      .catch((error) => {
        this.openErrorToast(error, "Close")
      })

  }


  /** Display toast to the user
  * @param message 
  * @param action 
  */
  openErrorToast(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: "bottom",
      horizontalPosition: "right",
      politeness: "polite",
    });
  }


  /** Display toast to the user
 * @param message 
 * @param action 
 */
  openInfoToast(message: string, action?: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
      verticalPosition: "bottom",
      horizontalPosition: "center",
      politeness: "polite",
    });
  }
}