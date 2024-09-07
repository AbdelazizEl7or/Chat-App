import { NbLayoutDirection, NbLayoutDirectionService } from '@nebular/theme';
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Uploader, UploadWidgetConfig, UploadWidgetResult } from 'uploader';
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

const swal: SweetAlert = _swal as any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  translRtl = {
    create: 'أضف',
    name: 'أسم',
    cancel: 'إلغاء',

    logIn: 'تسجيل دخول',
    typeMsg: 'أكتب الرسالة',
    password: 'الكلمة السرية',
    signIn: 'إنشاء حساب',
    Your: '',
    image: 'صورتك',
    upload: 'إرفع',
    account: 'حساب',
    are: 'هل',
    you: 'أنت',
    have: 'لديك',
  };
  translLtr = {
    create: 'Create',
    cancel: 'cancel',
    name: 'name',
    logIn: 'log In',
    password: 'password',
    signIn: 'sign In',
    Your: 'Your',
    image: 'Image',
    upload: 'Upload',
    account: 'account',
    are: 'are',
    you: 'You',
    have: 'Have',
  };
  transl = this.translLtr;
  rtlltr() {
    this.rtl = !this.rtl;
    if (this.rtl) {
      this.transl = this.translRtl;
      this.NbLayoutDirectionService.setDirection(NbLayoutDirection.RTL);
      window.localStorage.setItem('USER_CHAT_INFO_RTL', 'RTL');
    } else {
      this.transl = this.translLtr;
      this.NbLayoutDirectionService.setDirection(NbLayoutDirection.LTR);
      window.localStorage.setItem('USER_CHAT_INFO_RTL', 'LTR');
    }
  }
  rtl = false;
  loading = true;
  Dopen = false;
  PORT = 'https://chat-cz51.onrender.com/';
  //PORT = 'http://localhost:6060/';
  postU = 'add/chat-All-users';
  getU = 'get/chat-All-users';
  users: [] = [];
  uploadedFileUrl: any = 'https://img.icons8.com/color/344/user.png';
  uploader = Uploader({
    apiKey: 'free',
  });
  options: UploadWidgetConfig = {
    multi: false,
  };
  loginForm = new FormGroup({
    name: new FormControl('', [Validators.minLength(2), Validators.required]),
    password: new FormControl('', [Validators.minLength(2), Validators.required]),
    image: new FormControl('https://img.icons8.com/color/344/user.png', [Validators.minLength(2), Validators.required]),
  });
  loginForm2 = new FormGroup({
    name: new FormControl('', [Validators.minLength(2), Validators.required]),
    password: new FormControl('', [Validators.minLength(2), Validators.required]),
  });

  onComplete = (files: UploadWidgetResult[]) => {
    this.uploadedFileUrl = files[0]?.fileUrl;
    this.loginForm.controls['image'].setValue(this.uploadedFileUrl);
  };
  userData = window.localStorage.getItem('USER_CHAT_INFO_DATA')
    ? JSON.parse(window.localStorage.getItem('USER_CHAT_INFO_DATA') as string)
    : null;
  constructor(
    private router: Router,
    private NbLayoutDirectionService: NbLayoutDirectionService
  ) { }
  ngOnInit(): void {
    if (this.userData) {
      this.router.navigate(['']);
    } else {
      if (window.localStorage.getItem('USER_CHAT_INFO_RTL')! == 'RTL') {
        this.rtl = true;
        this.transl = this.translRtl;
        this.NbLayoutDirectionService.setDirection(NbLayoutDirection.RTL);
      } else {
        this.rtl = false;
        this.transl = this.translLtr;
        this.NbLayoutDirectionService.setDirection(NbLayoutDirection.LTR);
      }
      fetch(this.PORT + this.getU, { method: 'GET' })
        .then((response) => response.json())
        .then((myData) => {
          this.users = myData;
          this.loading = false;
        }).catch(e => {
          console.log(e);
        })
    }
  }
  showPassword = true;

  getInputType() {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
  openD() {
    this.Dopen = true;
  }
  logina() {
    let user: any;

    if (
      this.users.find(
        (u: any) => u.name.trim() == this.loginForm2.value.name?.trim()
      )
    ) {
      if (
        (
          this.users.find(
            (u: any) => u.name == this.loginForm2.value.name?.trim()
          ) as any
        ).password == this.loginForm2.value.password?.trim()
      ) {
        user = this.users.find(
          (u: any) => u.name == this.loginForm2.value.name?.trim()
        );
        this.loading = true;
        setTimeout(() => {
          window.localStorage.setItem(
            'USER_CHAT_INFO_DATA',
            JSON.stringify(user)
          );
          this.router.navigate(['']);
        }, 3000);
      } else {
        swal(this.rtl ? 'كلمة السر غير صحيحة' : 'password not good');
      }
    } else {
      swal(this.rtl ? 'لا يوجد حساب بهذا الأسم' : 'no account');
    }
  }
  login() {
    if (
      this.loginForm.value.name!.trim() &&
      this.loginForm.value.password!.trim()
    ) {
      if (!this.users.find((e: any) => e.name == this.loginForm.value.name)) {
        this.loading = true;
        let data: any = {
          name: this.loginForm.value.name,
          password: this.loginForm.value.password,
          image:
            this.loginForm.value.image ||
            'https://img.icons8.com/color/344/user.png',
          id: crypto.randomUUID(),
          status: 'online',

        };
        fetch(this.PORT + this.postU, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((error) => {
          console.log(error);
        }).then((e: any) => e.json().then((e: any) => {
          data._id = e.insertedId
          window.localStorage.setItem(
            'USER_CHAT_INFO_DATA',
            JSON.stringify(data)
          );
          this.router.navigate(['']);
        }))
      } else {
        swal(
          this.rtl
            ? 'هذا الأسم مستخدم في حساب أخر'
            : 'name is in another account'
        );
      }
    }
  }
}
