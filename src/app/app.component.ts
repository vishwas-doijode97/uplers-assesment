import { Component } from '@angular/core';
import { AppFileUploadComponent } from "./app-file-upload/app-file-upload.component";

@Component({
  selector: 'app-root',
  imports: [AppFileUploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'uplers-assesment';


}
