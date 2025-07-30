import { LightningElement, track, api } from 'lwc';
export default class DonorPreRegIPEggWithEdnAndPMCNoMatch extends LightningElement {
    @api edncodes;
    @track recordsList = [{'Name' : 'james'}];
    @track options = [
                        { value: 'Donor Agency', label: 'Donor Agency'},
                        { value: 'Egg Bank', label: 'Egg Bank'},
                        { value: 'Clinic Program', label: 'Clinic Program'},
                        { value: 'Independently Found', label: 'Independently Found'}
                    ]
    value = 'Select an option';
    /*connectedCallback() {
        if(this.edncodes){
            this.handleDonorDetails(this.edncodes);
        }
    }
    handleDonorDetails(edn){
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

    handleChange(event) {
        this.value = event.detail.value;
    }
}