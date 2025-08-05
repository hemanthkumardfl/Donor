import { LightningElement, track, api } from 'lwc';
import OFFSPRING_LOGO from '@salesforce/resourceUrl/OffspringLogo';
export default class DonorPreRegOffspringAgeVerification extends LightningElement {
    @track offSpringLogo = OFFSPRING_LOGO;
    @api contactObject;
    @track showAge = true;

     @track dob = {
        day: '',
        month: '',
        year: ''
    };

    @track showUnder18 = false;
    @track show18OrOlder = false;

    connectedCallback() {
        //code
        this.showAge = true;
    }

    // Handle changes to DOB fields
    handleDobChange(event) {
        const classList = event.target.classList;
        if (classList.contains('daycls')) {
            this.dob.day = event.target.value;
        } else if (classList.contains('monthcls')) {
            this.dob.month = event.target.value;
        } else if (classList.contains('yearcls')) {
            this.dob.year = event.target.value;
        }
    }

    handleContinueClick() {
        const { day, month, year } = this.dob;

        // Ensure all parts are present
        if (!day || !month || !year) {
            alert('Please enter a valid date of birth.');
            return;
        }

        const birthDate = new Date(`${year}-${month}-${day}`);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Reset both visibility flags
        this.showUnder18 = false;
        this.show18OrOlder = false;

        // Show the appropriate screen
        if (age < 18) {
            this.showUnder18 = true;
            this.showAge = false;
        } else {
            this.show18OrOlder = true;
            this.showAge = false;
        }
    }
}