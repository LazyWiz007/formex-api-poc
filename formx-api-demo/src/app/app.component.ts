import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'formx-api-demo';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  serverMessage: string = '';
  extractedData: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getMessageFromServer();
  }

  getMessageFromServer() {
    this.http.get<{ message: string }>('http://localhost:3000/api/message').subscribe(
      (response) => {
        this.serverMessage = response.message;
      },
      (error) => {
        console.error('Error fetching message from server:', error);
        this.serverMessage = 'Failed to connect to the server';
      }
    );
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.createPreviewUrl();
  }

  createPreviewUrl(): void {
    if (this.selectedFile) {
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  triggerFileInput(): void {
    document.getElementById('fileInput')?.click();
  }

  uploadFile(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post<any>('http://localhost:3000/api/extract', formData).subscribe(
        (response) => {
          this.extractedData = response.documents[0].data;
          // console.log(response);
        },
        (error) => {
          console.error('Error extracting data:', error);
          this.extractedData = { error: 'Failed to extract data from the file' };
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }
}
