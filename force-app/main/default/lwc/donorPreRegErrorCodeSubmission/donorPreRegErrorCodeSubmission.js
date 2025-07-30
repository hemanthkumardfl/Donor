import { LightningElement, track, api } from 'lwc';
import ERROR_LOGO from '@salesforce/resourceUrl/Error_Icon';
import pmcEmailVerification from '@salesforce/apex/EggDonorPreRegistrationController.pmcEmailVerification'; 


export default class DonorPreRegErrorCodeSubmission extends LightningElement {

    @track errorLogo = ERROR_LOGO;
    @track alternateEmail = '';
    @track alternatePhone = '';
    @track isOptOut = false;
    @api contactObj;
    @track selectedOption = '';

    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
    }

    handleErrorCodeSubmissionBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    async handleErrorCodeSubmissionNext() {
        let alternateEmailAndPhone = {};
        let inputList = this.template.querySelectorAll('lightning-input');
        inputList.forEach(input => {
            const { name, value } = input;
            alternateEmailAndPhone[name] = value;
        })
        alternateEmailAndPhone['isOptOut'] = (this.selectedOption == 'Option2');
        this.contactObj['alternateDetails'] = alternateEmailAndPhone;
        console.log('Test 123 >>> '+JSON.stringify(this.contactObj))
        if (this.selectedOption != 'Option2' || (this.selectedOption == '')) {
            if (alternateEmailAndPhone.email && alternateEmailAndPhone.phone) {
                console.log('Started');
                let result = await pmcEmailVerification({ contactObj: JSON.stringify(this.contactObj) });
                console.log('Result >>> '+JSON.stringify(result));
                if(result.isSuccess){
                    this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                }
            }
            else {
                alert('Please fill Email and Phone');
            }
        }
        else {
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }
    }

    HandleOption(event) {
        this.template.querySelectorAll('.section-box').forEach((element) => {
            if (element.dataset.name == event.currentTarget.dataset.name) {
                element.classList.add('divSelected');
                this.selectedOption = element.dataset.name;
            } else {
                element.classList.remove('divSelected');
            }
        })
    }

}