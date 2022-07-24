import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, LoadingController } from '@ionic/angular';

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

  public loading: HTMLIonLoadingElement;
  public image = null;
  public FaceDetails: Array<any> = [];

  constructor(private http: HttpClient, private alertController: AlertController, private loadingCtrl: LoadingController) {}

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Agnitio',
      subHeader: 'Info',
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async showLoading(message) {
    this.loading = await this.loadingCtrl.create({
      message
    });
    
    this.loading.present();
  }

  async hideLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }

  async takePicture() {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    this.image = 'data:image/png;base64,' + photo.base64String;
    const blob = this.base64ToArrayBuffer(photo.base64String);

    const { signedUrl, fileName } = await this.getSignedUrl(blob.type);
    try {
      await this.showLoading('Recognizing...');
      await this.uploadFile(signedUrl, blob);
      const result: any = await this.recognize(fileName);
      this.FaceDetails = result.FaceDetails;
      if(this.FaceDetails.length === 0) {
        await this.presentAlert('No faces found');
      }
    } catch (error) {
      console.log(error);
    } finally {
      await this.hideLoading();
    }
  }

  base64ToArrayBuffer(imageData): Blob {
    const rawData = atob(imageData);
    const bytes = new Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      bytes[i] = rawData.charCodeAt(i);
    }
    const arr = new Uint8Array(bytes);
    const blob = new Blob([arr], {type: 'image/png'});
    return blob;
  }

  async getSignedUrl(type: string): Promise<SignedUrl> {
    const url = await environment.api + '/get-signed-url?ContentType=' + encodeURIComponent(type);
    const result = await this.http.get(url).toPromise();
    return result as SignedUrl;
  }

  async recognize(fileName: string) {
    const url = await environment.api + '/recognize';
    const result = await this.http.post(url, { fileName }).toPromise();
    return result;
  }

  async uploadFile(link: string, file: Blob) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': file.type,
      }),
    };
    return await this.http.put(link, file, options).toPromise();
  }

}