import { LightningElement,track, api } from 'lwc';
export default class DonorPreRegDonorVideos extends LightningElement {

    @api donorType = 'egg';
    @track showDonorVideo =  false;
    @track preRegistrationScreens =  false;
    @track selectedDonorType = 'egg';
    @track contactObj;

    connectedCallback() {
       this.showDonorVideo = true;
    }

    handleDonorVideoContinue(event) {
       this.showDonorVideo = false;
       this.preRegistrationScreens = true;
       this.contactObj = JSON.parse(JSON.stringify(event.detail));
    }

    handleDonorVdeoBack() {
        this.preRegistrationScreens = false;
        window.location.href = 'https://flow-nosoftware-7027--dev.sandbox.my.salesforce-sites.com/donor21/home';
    }
}