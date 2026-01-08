import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideForms } from '@angular/forms';

bootstrapApplication(AppComponent, {
  providers: [provideForms()]
}).catch(err => console.error(err));

