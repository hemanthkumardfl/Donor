import { LightningElement, track } from 'lwc';
import myResource from '@salesforce/resourceUrl/DonorImage';
export default class donorIntroComponent extends LightningElement {
    backgroundStyle =  `background-image: url(${myResource});`
    handleDonorClick(event) {
        var pageName = event.currentTarget.dataset.name;
        if(pageName == 'donor'){
            window.open('/donor-registration', '_self');
        }
        if(pageName == 'parent'){
            window.open('/parent-registration', '_self');
        }
    }
}