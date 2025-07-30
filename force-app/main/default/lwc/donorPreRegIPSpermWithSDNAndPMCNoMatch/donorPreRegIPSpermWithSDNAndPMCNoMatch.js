import { LightningElement, track, api } from 'lwc';
export default class DonorPreRegIPSpermWithSDNAndPMCNoMatch extends LightningElement {
    @api sdncodes;
    @track recordsList = [{'Name' : 'james'}];
    @track options = [
                        { value: 'Sperm Bank', label: 'Sperm Bank'},
                        { value: 'Clinic Program', label: 'Clinic Program'},
                        { value: 'Independently Found', label: 'Independently Found'},
                        { value: 'Family/Friend', label: 'Family/Friend'}
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