import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo, ImageOptions } from '@capacitor/camera';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface SignedUrl {
  signedUrl: string;
  fileName: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public image = null;
  public isRecognized = false;

  constructor(private http: HttpClient) {}

  async takePicture() {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    this.image = 'data:image/png;base64,' + photo.base64String;

    const { signedUrl, fileName } = await this.getSignedUrl();
    try {
      await this.uploadFile(signedUrl, photo.base64String);
    } catch (error) {
      console.log(error);
    }
  }

  base64ToArrayBuffer(imageData) {
    const rawData = atob(imageData);
    const bytes = new Array(rawData.length);
    for (let x = 0; x < rawData.length; x++) {
      bytes[x] = rawData.charCodeAt(x);
    }
    const arr = new Uint8Array(bytes);
    const blob = new Blob([arr], {type: 'image/png'});
    return blob;
   }

  async getSignedUrl(): Promise<SignedUrl> {
    const url = await environment.api + '/get-signed-url';
    const result = await this.http.get(url).toPromise();
    return result as SignedUrl;
  }

  async recognize() {
    this.isRecognized = true;
  }

  async uploadFile(link: string, file) {
    file = this.base64ToArrayBuffer(file);
    console.log(file)
    const options = {
      headers: new HttpHeaders({
        'Content-Type': file.type,
      }),
    };
    return await this.http.put(link, file, options).toPromise();
  }

}