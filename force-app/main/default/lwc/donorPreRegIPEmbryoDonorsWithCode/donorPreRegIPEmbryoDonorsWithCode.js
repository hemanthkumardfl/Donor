import { LightningElement ,track } from 'lwc';
export default class DonorPreRegIPEmbryoDonorsWithCode extends LightningElement {

    @track embryoProgram = {
        name: '',
        website: '',
        phone: '',
        cityState: '',
        coordinatorName: '',
        coordinatorEmail: ''
    };

    @track clinic = {
        name: '',
        website: '',
        phone: '',
        cityState: '',
        coordinatorName: '',
        coordinatorEmail: ''
    };

    @track family = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        donorCode: ''
    };

    
    handleProfileUpload(event) {
        const file = event.target.files[0];
        // Handle file upload logic
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        // Handle file upload logic
    }

    handleAdditionalInfoChange(event) {
        // Handle additional info textarea change
        this.family.additionalInfo = event.target.value;
    }

    handleSpermBankInfoBack() {
        // Handle back button logic
    }

    handleSpermBankInfoNext() {
        // Handle next button logic
    }
}