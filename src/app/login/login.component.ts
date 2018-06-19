import { Component, OnInit, HostBinding } from '@angular/core';
import { AngularFireAuth, AngularFireAuthModule } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { moveIn } from '../router.animations';
import * as firebase from 'firebase/app';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  cardForm: FormGroup;

  error: any;
  constructor(public af: AngularFireAuth,private router: Router, private fb: FormBuilder) {

      this.af.authState.subscribe(auth => { 
      if(auth) {
        this.router.navigateByUrl('/members');
      }
    });
    this.cardForm = fb.group({
      materialFormCardNameEx: ['', Validators.required],
      materialFormCardEmailEx: ['', [Validators.email, Validators.required]],
      materialFormCardConfirmEx: ['', Validators.required],
      materialFormCardPasswordEx: ['', Validators.required]
    });

  }

  loginFb() {
    this.af.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  }

  loginGoogle() {
    this.af.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  ngOnInit() {
  }

}
