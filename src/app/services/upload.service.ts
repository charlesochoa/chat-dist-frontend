import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType, HttpHeaders } from  '@angular/common/http';  

import { map } from  'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class UploadService { 

  config = new ConfigService();

  httpOptions = {
    headers: new HttpHeaders({
      enctype : 'multipart/form-data',
      observe: 'events',
      reportProgress: 'true',
      
    })
  };
  constructor(private httpClient: HttpClient) { }
  

  public upload(data: FormData) {
    return this.httpClient.post<any>(this.config.FILES_CTRL + "upload", data,this.httpOptions);
    
  }

  public download(fileName: string) 
  {
    // return this.httpClient.get(this.config.FILES_CTRL + "download-file/" + fileName,this.config.httpOptions);
  }
}
