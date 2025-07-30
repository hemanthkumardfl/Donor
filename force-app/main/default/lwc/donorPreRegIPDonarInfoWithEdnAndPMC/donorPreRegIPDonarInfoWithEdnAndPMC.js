import { LightningElement, track, api } from 'lwc';
// import getDonorDetails from '@salesforce/apex/PreRegistrationController.getDonorDetails';
export default class DonorPreRegIPDonarInfoWithEdnAndPMC extends LightningElement {
    @api edncodes;
    @track recordsList = [{'name' : 'jones'}];
    /*connectedCallback() {
        if(this.edncodes){
            this.handleDonorDetails(this.edncodes);
        }
    }
    /*handleDonorDetails(edn){
        getDonorDetails({'donorcodes' : edn})
        .then(result => {
            this.recordsList = result;
            console.log(JSON.stringify(edn));
            console.log(JSON.stringify(this.recordsList));
        })
        .catch(exception => {
            console.log(exception);
        })
    }*/
}