import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  NbThemeModule,
  NbLayoutModule,
  NbInputModule,
  NbCardModule,
  NbButtonModule,
  NbSpinnerModule,
  NbSidebarModule,
  NbSidebarService,
  NbIconModule,
  NbUserModule,
  NbChatModule,
  NbAlertModule,
  NbLayoutDirection,
  NbSelectModule,
  NbTabsetModule,
  NbButtonGroupModule,
  NbCheckboxModule,
  NbToastrService,
  NbToastrModule,
  NbChatCustomMessageDirective,
  NbDialogModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { UploaderModule } from 'angular-uploader';
@Injectable({ providedIn: 'any' })
@NgModule({
  declarations: [AppComponent, LoginComponent, HomeComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'dark' }, [], [], NbLayoutDirection.LTR),
    NbLayoutModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbSelectModule,
    NbEvaIconsModule,
    NbIconModule,
    NbSpinnerModule,
    NbChatModule,
    NbUserModule,
    NbAlertModule,
    NbSidebarModule,
    NbTabsetModule,
    NbButtonGroupModule,
    NbCheckboxModule,
    UploaderModule,
    NbToastrModule.forRoot(),
    NbDialogModule.forRoot()

  ],
  providers: [NbSidebarService, NbToastrService],
  bootstrap: [AppComponent],
})
export class AppModule { }
