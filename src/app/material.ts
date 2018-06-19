import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import {MatCardModule} from '@angular/material/card';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule
    ],
  exports: [
      MatButtonModule,
      MatCheckboxModule,
      MatCardModule
    ],
})
export class MaterialModule { }