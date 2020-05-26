import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http';  
import { ConfigService } from '../config/config.service';

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
  
  set_authorization(token: string) {
    this.config.set_authorization(token); 
      
  } 

  public download() 
  {
    // return this.httpClient.get(this.config.FILES_CTRL + "download-file/" + fileName,this.config.httpOptions);
  }
}
