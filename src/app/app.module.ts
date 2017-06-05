import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent }  from './app.component';
import { MapService }  from './services/map.service';
import { VehicleService }  from './services/vehicle.service';

@NgModule({
  imports:      [
  	BrowserModule,
  	FormsModule,
  	HttpModule
  ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ],
  providers: [
  	MapService,
  	VehicleService
  ]
})
export class AppModule { }
