import { Response } from '@angular/http';
import { AuthService } from './../../Services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validator, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { FlashMessagesService } from 'angular2-flash-messages';
declare var $: any;
declare var google: any;

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.css']
})
export class LoginSignupComponent implements OnInit {
  authUser: any[] = [];
  loginForm: FormGroup;
  forgotForm: FormGroup;
  signupForm: FormGroup;
  newsLetterForm: FormGroup;
  emailExits: boolean = false;
  constructor(
    private authService: AuthService, private fb: FormBuilder,
    private _flashMessagesService: FlashMessagesService) {
    this.createForms();
  }
  ngOnInit() {
    this.authService.currentAuth.subscribe((u) => this.authUser = u);
     const addEnput = document.getElementById('address');
      var options = {
        componentRestrictions: {country: "au"}
       };
       const addAuto = new google.maps.places.Autocomplete(addEnput, options);
       addAuto.addListener('place_changed', () => {
         this.signupForm['controls']['address'].setValue(addAuto.getPlace().formatted_address);
         this.signupForm['controls']['delv_address'].setValue(addAuto.getPlace().formatted_address);
       });
  }
  customVal(Ac: AbstractControl) {
    var pass = Ac.get('pass').value;
    var passC = Ac.get('cPassword').value;
    if (pass !== passC) {
        Ac.get('cPassword').setErrors({ MatchPassword: true });
    }
    else {
        return null;
    }
  }
  createForms() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      pass: ['', Validators.required]
    });
    this.forgotForm = this.fb.group({
      email: ['', Validators.required]
    });
    this.newsLetterForm = this.fb.group({
      email: ['', Validators.required]
    });
    this.signupForm = this.fb.group({
	  customer_type: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      pass: ['', Validators.required],
      cPassword: ['', Validators.required],
      contact_no: '',
      apartment: '',
      address: '',
      delv_address: '',
      delv_address_apartment: '',
    }, { validator: this.customVal});
  }

  doLogin(values) {
    this.authService.doLogin(values).subscribe(data => {
      if(data[0].status) {
        this.authUser.push(data[0]['id']);
        localStorage.setItem('user', data[0]['id']);
        $('#signinModal').modal('hide');
        this._flashMessagesService.show('Your are login successfully!', { cssClass: 'alert-success', timeout: 2000 });
      } else {
        this._flashMessagesService.show('Login Failure!', { cssClass: 'alert-danger', timeout: 2000 });
      }
    });
  }

  forgotPass(values){
    this.authService.forgotPass(values).subscribe(data => {
      console.log(data);
      if(data[0].status=='Deactive') {
        this._flashMessagesService.show(data[0].msg, { cssClass: 'alert-danger', timeout: 2000 });
      } else if(data[0].status=='fail') {
        this._flashMessagesService.show(data[0].msg, { cssClass: 'alert-danger', timeout: 2000 });
      }else if(data[0].status=='True'){
        $('#forgotModal').modal('hide');
        this._flashMessagesService.show(data[0].msg, { cssClass: 'alert-success', timeout: 2000 });
      }
    });
  }

  signup(values) {
    let loginData = {
      email:values.email,
      pass:values.pass
    }
    this.authService.signUp(values).subscribe(data => {
      if(data[0].status=='Deactive') {
        this.authService.doLogin(loginData).subscribe(ldata => {
          $('#signupModal').modal('hide');
          localStorage.setItem('user', ldata[0].id);
          this._flashMessagesService.show('Your are register successfully!', { cssClass: 'alert-success', timeout: 2000 });
        });
      } else {
        this._flashMessagesService.show('Register Failure!', { cssClass: 'alert-danger', timeout: 2000 });
      }
    });
  }

  onblurMethod(evt) {
    let EmailData = {
      email : evt.target.value
    }
  
    this.authService.checkuser(EmailData).subscribe(data => {
      if(data[0].status == 'False') {
        this.emailExits = true;
        this._flashMessagesService.show('Please use diffrent email!', { cssClass: 'alert-danger', timeout: 2000 });
      } else {
        this.emailExits = false;
      }
    });
  }

}
