import { LightningElement, api, track } from 'lwc';

export default class DonorPreRegSideBar extends LightningElement {
    @api optionname;
    @api registrationType;
    @api donorType;
    @track sideBarList = [];
    @track eggSideBarList = [
        { name: 'getstarted', index: '1', label: 'Get Started' },
        { name: 'securityverification', index: '2', label: 'Security Verification' },
        { name: 'codesubmission', index: '3', label: 'Code Submission' },
        { name: 'donationbasics', index: '4', label: 'Donation Basics' },
        { name: 'agencyInfo', index: '5', label: 'Agency Info' },
        { name: 'clinicinfo', index: '6', label: 'Clinic Info' },
        { name: 'fertilityAttorney', index: '7', label: 'Fertility Attorney' },
        { name: 'recipientInfo', index: '8', label: 'Recipient Info' },
        { name: 'donationOutcome', index: '9', label: 'Donation Outcomes' },
        { name: 'hippaPrep', index: '10', label: 'HIPAA Prep' },
        { name: 'hippaSign', index: '11', label: 'HIPAA Sign' },
        { name: 'matchVerification', index: '12', label: 'Finish Registration' }
    ];

    @track parentSideBarList = [
        { name: 'getstarted', index: '1', label: 'Get Started' },
        { name: 'securityverification', index: '2', label: 'Security Verification' },
        { name: 'codesubmission', index: '3', label: 'Code Submission' },
        { name: 'RecipientDetails', index: '4', label: 'Recipient Details' },
        { name: 'JourneyInfo', index: '5', label: 'Journey Info' },
        { name: 'DonorInformation', index: '6', label: 'Donor Information' },
        { name: 'HipaaRelease', index: '7', label: 'Hipaa Release' },
        { name: 'ProductSelection', index: '8', label: 'Product Selection' },
        { name: 'Billing Set-up', index: '9', label: 'Billing Set-up' },
        { name: 'Match Verification', index: '10', label: 'Match Verification' },
    ];

    @track spermSideBarList = [
        { name: 'getstarted', index: '1', label: 'Get Started' },
        { name: 'securityverification', index: '2', label: 'Security Verification' },
        { name: 'codesubmission', index: '3', label: 'Code Submission' },
        { name: 'donationbasics', index: '4', label: 'Donation Basics' },
        { name: 'bankinfo', index: '5', label: 'Bank Info' },
        { name: 'clinicinfo', index: '6', label: 'Clinic Info' },
        { name: 'recipientInfo', index: '7', label: 'Recipient Info' },
        { name: 'donationOutcome', index: '8', label: 'Donation Outcomes' },
        { name: 'hippaPrep', index: '9', label: 'HIPAA Release' },
        { name: 'hippaSign', index: '10', label: 'HIPAA Sign' },
        { name: 'matchVerification', index: '11', label: 'Finish Registration' }
    ];

    @track offSpringSideBarList = [
        { name: 'getstarted', index: '1', label: 'Get Started' },
        { name: 'securityverification', index: '2', label: 'Verification' },
        { name: 'codesubmission', index: '3', label: 'Age Verify' },
        { name: 'donationbasics', index: '4', label: 'Codes' },
        { name: 'bankinfo', index: '5', label: 'Parties Involved' },
        { name: 'clinicinfo', index: '6', label: 'Donor Info' },
        { name: 'recipientInfo', index: '7', label: 'Professionals Info' },
        { name: 'donationOutcome', index: '8', label: 'HIPAA Prep' },
        { name: 'hippaPrep', index: '9', label: 'HIPAA Form' },
        { name: 'hippaSign', index: '10', label: 'Contact Select' },
        { name: 'matchVerification', index: '11', label: 'Finish' }
    ];

    connectedCallback() {
        if (this.donorType === 'egg') {
            this.sideBarList = this.eggSideBarList;
        } else if (this.donorType === 'sperm') {
            this.sideBarList = this.spermSideBarList;
        }  else if (this.donorType === 'parent') {
            this.sideBarList = this.parentSideBarList;
        } 
        else if(this.donorType === 'offSpring'){
             this.sideBarList = this.offSpringSideBarList;
        }
        else {
            this.sideBarList = [];
        }
    }

    get steps() {
        return this.sideBarList.map(step => ({
            ...step,
            class: `eggdonorsidebarcls slds-p-left_x-small ${this.optionname === step.name ? 'active-step' : ''}`,
            parentClass: this.optionname === step.name ? 'active-parent' : ''
        }));
    }
}