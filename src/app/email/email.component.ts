import { Component, OnInit } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth, AngularFireAuthModule } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { moveIn, fallIn } from '../router.animations';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  animations: [moveIn(), fallIn()],
  host: {'[@moveIn]': ''}
})

export class EmailComponent implements OnInit {
    state: string = '';
    error: any;
    email:string;
    password:string;

    constructor(public af: AngularFireAuth,private router: Router) {
    this.af.authState.subscribe(auth => { 
      if(auth) {
        this.router.navigateByUrl('/members');
      }
    });
  }


  onSubmit(formData) {
    if(formData.valid) {
      this.af.auth.signInWithEmailAndPassword(formData.value.email,formData.value.password).catch(result => {
        if(!result.success){
          this.error = result.message;
        } 
      });
    } 
  }

  ngOnInit() {
  }

}
