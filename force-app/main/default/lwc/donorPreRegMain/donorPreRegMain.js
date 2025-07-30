import { LightningElement, api, track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import DONOR_PRE_REG_SIDEBAR_CSS from '@salesforce/resourceUrl/donorPreRegSideBarCSS';
import DONOR_PRE_REG_MAIN_CSS from '@salesforce/resourceUrl/donorPreRegMainCSS';

export default class DonorPreRegMain extends LightningElement {

    @track showGetStarted = false;
    @track showDonorTypes = false;
    @track showVideo = false;
    @track showSideBar = false;
    @track showDonationBasics = false;
    @track showSpermBankInfoWithSDN = false;
    @track showClinicInfoWithNoSDN = false;
    @track showClinicInfoWithSDN = false;
    @track showSpermBankInfo = false;
    @track showCodeSubmission = false;
    @track showEggDonor = false;
    @track showRecipientDetails = false;
    @track sideBarSize = 0;
    @track fullScreen = 0;
    @track donorType;
    @track progressValue = 10;
    @track isFirst = true
    @track donorBasics = true

    connectedCallback() {
        this.showDonorTypes = true;
        this.fullScreen = 12;
      //  loadStyle(this, DONOR_PRE_REG_SIDEBAR_CSS);
      //  loadStyle(this, DONOR_PRE_REG_MAIN_CSS);
    }

    get currentStep() {
        if (this.showEggDonor) {
            return "getstarted";
        }
    }

    handleNext(event) {
        this.donorType = event.detail.donorType;
        this.showDonorTypes = false;
        this.showVideo = true;
        this.fullScreen = 12;
    }

    handleContinue(event) {
        this.showGetStarted = true;
        this.showSideBar = true;
        this.sideBarSize = 2;
        this.fullScreen = 10;
        this.showVideo = false;
        this.donorBasics = false;
        this.showDonorTypes = false;
    }

    handleBack(){
        this.showVideo = false;
        this.showDonorTypes = true;
        this.fullScreen = 12;
        this.sideBarSize = 0;
        this.showGetStarted = false;
        this.showSideBar = false;
    }

    handleGetStartedContinue(event){
        this.showGetStarted = false;
        this.showCodeSubmission = true;
        this.showSideBar = true;
        this.showVideo = false;
        this.showDonorTypes = false;
    }
    
    handleGetStartedCancel(){
        this.showGetStarted = false;
        this.showVideo = true;
        this.showSideBar = false;
        this.fullScreen = 12;
        this.sideBarSize = 0;
    }

    handleDonationBasicsBack(){
        this.showDonationBasics = false;
        this.showCodeSubmission = true;
    }

    handleDonationBasicsNext(){
        this.showDonationBasics = false;
        this.showSpermBankInfoWithSDN = true;
    }

    handleClinicInfoNext(){
        this.showClinicInfoWithNoSDN = false;
        this.showClinicInfoWithSDN = true;
    }

    handleClinicInfoBack(){
         this.showClinicInfoWithNoSDN = false;
         this.showSpermBankInfoWithSDN = true;
    }

    handleSpermBankInfoWithSDNNext(){
        this.showSpermBankInfoWithSDN = false;
        this.showClinicInfoWithNoSDN = true;
    }

    handleSpermBankInfoWithSDNBack(){
        this.showSpermBankInfoWithSDN = false;
        this.showDonationBasics = true;
    }

    handleClinicInfoWithSDNBack(){
        this.showClinicInfoWithSDN = false;
        this.showClinicInfoWithNoSDN = true;
    }

    handleClinicInfoWithSDNNext(){
        this.showClinicInfoWithSDN = false;
        this.showSpermBankInfo = true;
    }

    handleSpermBankInfoNext(){
        this.showSpermBankInfo = false;
        this.showRecipientDetails = true;
    }

    handleSpermBankInfoBack(){
        this.showSpermBankInfo = false;
        this.showClinicInfoWithSDN = true;
    }

    handleRecipientDetailsNext(){
        this.showRecipientDetails = false;
    }

    handleRecipientDetailsBack(){
        this.showRecipientDetails = false;
        this.showSpermBankInfo = true;
    }

    handleCodeSubmissionBack(){
        this.showCodeSubmission = false;
        this.showGetStarted = true
    }

    handleCodeSubmissionNext(){
        this.showCodeSubmission = false;
        this.showDonationBasics = true;
    }
}