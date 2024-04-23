import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimationService } from '../services/animation.service';

import { LoginComponent } from './login/login.component';
import { SigninComponent } from './signin/signin.component';
import { SendemailComponent } from './sendemail/sendemail.component';
import { ChooseavatarComponent } from './chooseavatar/chooseavatar.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    SendemailComponent,
    RouterLink,
    ChooseavatarComponent,
    LoginComponent,
    SigninComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  isSignIsShowen = false;
  isResetPwIsShowen = false;
  isLoginShowen = true;
  animationService = inject(AnimationService);
  animationPlayed = 0

  chooseAvatar = false;

  constructor() {
  }

  showPwComponent(event: boolean) {
    this.isResetPwIsShowen = event;
    this.isLoginShowen = false;
    this.isSignIsShowen = false;
  }

  showSignInComponent(event: boolean) {
    this.isSignIsShowen = event;
    this.isLoginShowen = true;
  }

  goToSignIn() {
    this.isLoginShowen = false;
    this.isSignIsShowen = true;
  }


  showMain(event: boolean) {
    this.isLoginShowen = true
    this.isResetPwIsShowen = false;
    this.isSignIsShowen = false;
    this.chooseAvatar = false;
  }

  showAvatar(event: boolean) {
    this.chooseAvatar = event;
    this.isLoginShowen = false;
    this.isResetPwIsShowen = false;
    this.isSignIsShowen = false;
  }


  ngOnInit() {
    const amount = sessionStorage.getItem('animation')
    if (amount !== null) {
      this.animationPlayed = parseInt(amount)
      console.log(amount)
    }
  }
  



}
