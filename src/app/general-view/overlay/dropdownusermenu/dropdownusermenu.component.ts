import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// import services
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';

@Component({
  selector: 'app-dropdownusermenu',
  standalone: true,
  imports: [],
  templateUrl: './dropdownusermenu.component.html',
  styleUrl: './dropdownusermenu.component.scss'
})
export class DropdownusermenuComponent {
  overlayCtrlService = inject(OverlaycontrolService);

  constructor(private router: Router){}

  logOut() {
    this.router.navigate(['/'])
    this.overlayCtrlService.hideOverlay();
  }
}