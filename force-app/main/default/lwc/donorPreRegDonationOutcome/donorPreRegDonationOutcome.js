import { LightningElement, track, api } from 'lwc';
export default class DonorPreRegDonationOutcome extends LightningElement {
     yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    @track liveBirths = 0;
    @track selectedOption = '';
    @track value = '';
    @api donationOutcomeUserInputObj;
    @api contactObj;

    connectedCallback() {
       this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        console.log('donationOutcome records @@@@');
        console.log(JSON.stringify(this.contactObj));

        if (this.contactObj && this.contactObj.donationOutcome) {
            if(this.contactObj.donationOutcome.liveBirthsCount){
                this.liveBirths = this.contactObj.donationOutcome.liveBirthsCount;
            }
            this.selectedOption = this.contactObj.donationOutcome.selectedOption;
            this.value = this.contactObj.donationOutcome.selectedOption;
            console.log('donationOutcome @@@@');
            console.log(JSON.stringify(this.contactObj));
        } 
        /*else if (this.donationOutcomeUserInputObj && Object.values(this.donationOutcomeUserInputObj).length > 0) {
            this.liveBirths = this.donationOutcomeUserInputObj.liveBirthsCount || 0;
            this.selectedOption = this.donationOutcomeUserInputObj.selectedOption || 'Yes';
            this.value = this.selectedOption;
            console.log(JSON.stringify(this.donationOutcomeUserInputObj));
        }*/
    }

     handleDonationOutcomeBack() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        this.contactObj.donationOutcome = {
            liveBirthsCount: this.liveBirths,
            selectedOption: this.selectedOption
        };
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }

    handleDonationOutcomeNext(){
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        this.contactObj.donationOutcome = {
            liveBirthsCount: this.liveBirths,
            selectedOption: this.selectedOption
        };
        console.log(this.liveBirths);
        console.log(this.selectedOption);
        console.log(JSON.stringify(this.contactObj));
        this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
    }

    handleDonationOutcomeChange(event){
        this.selectedOption = event.detail.value;
        console.log(this.selectedOption);
    }

    handleRemove(event){
        this.liveBirths >0 ? this.liveBirths -- : 0;
    }

    handleAddNew(event){
         this.liveBirths++
    }

    handleInputValidate(event){
        console.log(event.key)
        if (['e', 'E', '+', '-', '.', 'b', 'B', 't', 'T', 'k', 'K', 'm', 'M'].includes(event.key)) {
            console.log('true')
            event.preventDefault();
        }
    }

    handleInputChange(event){
        console.log(event.target.value);
         this.liveBirths = parseInt(event.target.value);
    }
    
    get liveBirthDisableCls(){
        let clsName = 'donationLiveBirthCls';
        if(this.selectedOption == 'No'){
            clsName = 'disableSpan';
             this.liveBirths = 0;
        }
        else{
             clsName = 'donationLiveBirthCls';
        }
        return clsName;
    }
}