import { LightningElement, track, api } from 'lwc';
import updateGetStarted from '@salesforce/apex/EggDonorPreRegistrationController.updateGetStarted';
import sendOTPToEmailOrPhone from '@salesforce/apex/EggDonorPreRegistrationController.sendOTPToEmailOrPhone';
import verifyOTP from '@salesforce/apex/EggDonorPreRegistrationController.verifyOTP';
import updateDonationBasics from '@salesforce/apex/EggDonorPreRegistrationController.updateDonationBasics';
import deleteOtp from '@salesforce/apex/EggDonorPreRegistrationController.deleteOtp';
import resendCode from '@salesforce/apex/EggDonorPreRegistrationController.resendCode';
import createSpermBank from '@salesforce/apex/SpermDonorPreRegistrationController.createSpermBank';
import createSpermDonorClinic from '@salesforce/apex/SpermDonorPreRegistrationController.createSpermDonorClinic';
import createSpermDonorRecipients from '@salesforce/apex/SpermDonorPreRegistrationController.createSpermDonorRecipients';
import createSpermDonorDonationOutcome from '@salesforce/apex/SpermDonorPreRegistrationController.createSpermDonorDonationOutcome';
import deleteOTPCode from '@salesforce/apex/EggDonorPreRegistrationController.deleteOTPCode';
import validateCodeSubmission from '@salesforce/apex/EggDonorPreRegistrationController.validateCodeSubmission';
import verifyReEnterCodes from '@salesforce/apex/EggDonorPreRegistrationController.verifyReEnterCodes';
import updateAgencyWithoutCode from '@salesforce/apex/EggDonorPreRegistrationController.updateAgencyWithoutCode';
import updateDonationCycles from '@salesforce/apex/EggDonorPreRegistrationController.updateDonationCycles';
import updateClinicWithoutCode from '@salesforce/apex/EggDonorPreRegistrationController.updateClinicWithoutCode';
import updateAttorneyWithoutCode from '@salesforce/apex/EggDonorPreRegistrationController.updateAttorneyWithoutCode';
import updateRecipientWithoutCode from '@salesforce/apex/EggDonorPreRegistrationController.updateRecipientWithoutCode';
import fetchSpermDonorDetails from '@salesforce/apex/EggDonorPreRegistrationController.fetchSpermDonorDetails';
import fetchSpermDonorClinicDetails from '@salesforce/apex/EggDonorPreRegistrationController.fetchSpermDonorClinicDetails';
import verifyGivenCodesEmail from '@salesforce/apex/EggDonorPreRegistrationController.verifyGivenCodesEmail';
import getRelatedRecords from '@salesforce/apex/EggDonorPreRegistrationController.getRelatedRecords';


export default class DonorPreRegistrationMainScreen_Clone extends LightningElement {

    @track showGetStarted = true;
    @api donorType;
    @track showDonorTypes = false;
    @track showVideo = false;
    @track showSideBar = true;
    @track showDonationBasics = false;
    @track showSpermBankInfoWithSDN = false;
    @track showClinicInfoWithNoSDN = false;
    @track showClinicInfoWithSDN = false;
    @track showSpermBankInfo = false;
    @track showEggDonor = false;
    @track showCodeSubmission = false;
    @track showAgeVerification= false;
    @track showRecipientDetails = false;
    @track showErrorCodeSubmission = false;
    @track showCodeError = false;
    @track eggClinicWithEdnUserInputs;
    @track sideBarSize = 0;
    @track isFirst = true
    @track donorBasics = true
    @track showshowDonationOutcome = false;
    @track showMatchVerification = false;
    @track showHippaScreen = false;
    @track showHippaSign = false;
    @track securitydescription = 'Your Safety matter to us. We just sent a six digit security code to your email or phone please enter it below to verify your account';
    @track securityVerification = 'Security Verification';
    @track styleInfo = "color:black"
    @track isValidationError = false; //this holds value for security verification result either valid or invalid
    @track isTwoFactor = false;
    @track stepnumber = 1;
    @api registrationType = 'Sperm Donor Registration'
    @track showEggAgencyOrBankWithoutEDN = false
    @track showEggClinicWithoutEDN = false
    @track showEggAttorneyWithoutEDN = false;
    @track currentMobileStepName = ''
    @track showEggAgencyOrBankWithEDN = false;
    @track showEggClinicWithEDN = false;
    @track showEggAttorneyWithEDN = false;
    @track showEggCycleOutcome = false;
    @track showIPProductSelection = false;
    @track isMobile = false;
    @track isTab = false;
    @track mainLayoutItemSize = 10;
    @track firstItem = 2;
    @track secondItem = 8;
    @track thirdItem = 2;
    @track screenType;
    @track width;
    @track donationBasicsUserInput;
    @track eggDonorAgencyUserInput;
    @track eggClinicWithoutEdnUserInputs;
    @track fertilityAttorneyWithoutEDNUserInput;
    @track eggCycleOutComeUserInput;
    @api contactObj;
    @track contactId;
    @track codeSumbissionUserInput;
    @track eggDonorAgencyUserInputWithCode;
    @track eggDonorAttorneyUserInputWithoutEDN
    @track spermBankUserInputWithoutSDN; //this holds the sperm donor without sdn user inputs 
    @track clinicUserInputWithoutSDN; //this holds the clinic without sdn user inputs 
    @track recipientUserInfoWithoutSDN; //this holds the recipient without sdn user inputs
    @track donationOutcomeUserInputObj;// this.holds the sperm donor donation outcome obj user input
    @track showEggRecipientScreen = false;
    @track isOptOut = false;
    @track bypassStep = false; //this bypass to donation outcomes.
    @track showEggHipaa = false;

    handleDevices() {

        this.width = window.innerWidth;
        if (this.width <= 480) {
            this.screenType = 'mobile';
        } else if (this.width <= 768) {
            this.screenType = 'tablet';
        } else if (this.width <= 1024) {
            this.screenType = 'desktop';
        } else {
            this.screenType = 'large-desktop';
        }

        this.isMobile = (this.screenType == 'mobile')
        this.isTab = (this.screenType == 'tablet')
        if (this.isTab) {
            this.isMobile = false;
            this.firstItem = 1;
            this.secondItem = 10;
            this.thirdItem = 1;
        }
        if (this.isMobile) {
            this.mainLayoutItemSize = 12;
            this.firstItem = 0;
            this.secondItem = 12;
            this.thirdItem = 0;
        }
        this.showDonorTypes = true;
    }

    get getRegistrationType() {
        return (this.donorType == 'egg' ? 'Egg Donor Registration' : (this.donorType == 'sperm') ? 'Sperm Donor Registration' : 'Embryo Donor Registration');
    }

    get currentStep() {
        if (this.showEggDonor) {
            return "getstarted";
        }
    }


    connectedCallback() {
        this.handleDevices()
    }


    async handleResendCode() {
        const response = await deleteOTPCode({ contactObj: JSON.stringify(this.contactObj) });
        console.log('Delete response >>>', JSON.stringify(response));
        const isOtpType = !this.contactObj['alternateDetails'];
        const result = await sendOTPToEmailOrPhone({
            contactObj: JSON.stringify(this.contactObj),
            isOtpType: isOtpType
        });
        console.log('Send OTP result >>>', JSON.stringify(result));
    }

    handleNext(event) {
        this.donorType = event.detail.donorType;
        this.showDonorTypes = false;
        this.showVideo = true;
    }

    handleContinue(event) {
        this.showGetStarted = true;
        this.showSideBar = true;
        this.sideBarSize = 2;
        this.showVideo = false;
        this.donorBasics = false;
        this.showDonorTypes = false;
    }

    handleBack() {
        this.showVideo = false;
        this.showDonorTypes = true;
        this.sideBarSize = 0;
        this.showGetStarted = false;
        this.showSideBar = false;
    }


    async handleGetStartedContinue(event) {
        let message = { isEmail: false, isPhone: false, completed: false }
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        console.log('Before >>> ' + JSON.stringify(this.contactObj))
        let result = await updateGetStarted({ contactObj: JSON.stringify(this.contactObj) });
        const child = this.template.querySelector('c-donor-pre-reg-get-started');
        if (result.isSuccess) {
            let contactRecord = JSON.parse(result.message);
            this.contactObj['lastName'] = contactRecord.lastName;
            this.contactObj['firstName'] = contactRecord.firstName
            this.contactObj['email'] = contactRecord.email;
            this.contactObj['phone'] = contactRecord.phone;
            this.contactObj['donorId'] = contactRecord.donorId;
            this.contactObj['preferredUserName'] = contactRecord.preferredUserName;
            this.contactObj['preferredPassword'] = contactRecord.preferredPassword;
            this.contactObj['verificationType'] = contactRecord.verificationType;
            this.contactObj['terms'] = contactRecord.terms;
            this.contactObj['donorType'] = this.donorType;
            console.log('After >>> ' + JSON.stringify(this.contactObj))
            let otpResult = await sendOTPToEmailOrPhone({ contactObj: JSON.stringify(this.contactObj), isOtpType: true });
            this.showGetStarted = false;
            this.isTwoFactor = true;
        }
        else if (result.message == 'Email Exists') {
            message.isEmail = true;
            if (child) {
                child.verifyEmailHandler(message);
            }
        }
        else if (result.message == 'Phone Exists') {
            message.isPhone = true;
            if (child) {
                child.verifyEmailHandler(message);
            }
        }
        else if (result.message == 'Completed') {
            message.completed = true;
            if (child) {
                child.verifyEmailHandler(message);
            }
        }
        else {
            console.log('Error >> ' + result.message);
        }
        // console.log('JSON Data >>> '+result.message)
        // let contactRecord = JSON.parse(result.message);
        // this.contactObj['lastName'] = contactRecord.lastName;
        // this.contactObj['firstName'] = contactRecord.firstName
        // this.contactObj['email'] = contactRecord.email;
        // this.contactObj['phone'] = contactRecord.phone;
        // this.contactObj['donorId'] = contactRecord.donorId;
        // this.contactObj['preferredUserName'] = contactRecord.preferredUserName;
        // this.contactObj['preferredPassword'] = contactRecord.preferredPassword;
        // this.contactObj['verificationType'] = contactRecord.verificationType;
        // this.contactObj['terms'] = contactRecord.terms;
    }

    handleGetStartedCancel(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showGetStarted = false;
        this.dispatchEvent(new CustomEvent('cancel', { detail: this.contactObj }));
    }

    async handleVerifyotp(event) {
        alert('In')
        try {
            alert('verify')
            this.contactObj = JSON.parse(JSON.stringify(event.detail));
            console.log(JSON.stringify(this.contactObj));
            let emailData = '';
            if (this.contactObj.alternateDetails) {
                emailData = this.contactObj.alternateDetails.email;
            }
            else {
                emailData = this.contactObj.email;
            }
            let result = await verifyOTP({ email: emailData, verificationOTPinput: this.contactObj.message });
            if (result.isSuccess) {
                this.isTwoFactor = false;
                if (!this.contactObj.alternateDetails) {
                    this.showAgeVerification = true;
                    this.showDonationBasics = false;
                }
                else {
                    this.contactObj['alternateDetails'] = null;
                    this.showDonationBasics = false;
                    this.showAgeVerification = true;
                }
            }
            else {
                this.isValidationError = true;
                const child = this.template.querySelector('c-donor-pre-reg-security-verification');
                if (child) {
                    child.isValidationError = true;
                }
            }
        }
        catch (error) {
            console.log(error.stack)
            console.log('Error >>> ' + JSON.stringify(error));
            console.log(error.message)
            console.log(JSON.stringify(this.contactObj));
        }
    }

    handleDonationBasicsBack(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showDonationBasics = false;
        this.showCodeSubmission = true;
    }

    async handleDonationBasicsNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        const donorType = this.donorType;
        const donationBasics = this.contactObj?.donationBasics?.[donorType];
        this.isOptOut = false;
       //alert('bypassPass' + this.bypassStep);//bypassStep
        console.log('contactObj' + JSON.stringify(this.contactObj))
        if (this.contactObj && this.contactObj.alternateDetails && this.contactObj.alternateDetails['isOptOut']) {
            this.isOptOut = true;
        }
        // alert(isOptOut);

        if (this.contactObj.donorType == "sperm") {
            let result = await updateDonationBasics({ contactObj: JSON.stringify(this.contactObj) });
            console.log('Result >>>', JSON.stringify(result));
            console.log('Test Check Object >>> ' + JSON.stringify(this.contactObj));
            this.showDonationBasics = false;
            if (donationBasics?.workWithAnySpermBank) {
                if (!this.contactObj['isSkipped'] && this.isOptOut == false && this.bypassStep == false) {
                    this.showSpermBankInfoWithSDN = true;
                    //alert('inside if block')
                }
                else {
                    //alert('inside else')
                    this.showSpermBankInfo = true;
                };
            }
            else if (donationBasics?.workWithAnyClinic) {
                let codes = this.contactObj['codes']
                if (!this.contactObj['isSkipped'] && codes && codes.PMC.length > 0 && this.isOptOut == false && this.bypassStep == false) {
                    let spermDonorClinicResponse = await fetchSpermDonorClinicDetails({ contactObj: JSON.stringify(this.contactObj) });
                    console.log('spermDonorClinicResponse' + JSON.stringify(spermDonorClinicResponse));
                    console.log('spermDonorClinicResponse message' + JSON.parse(spermDonorClinicResponse.message));
                    if (spermDonorClinicResponse.isSuccess) {
                        this.contactObj['sperBankClinicsWithCodes'] = JSON.parse(spermDonorClinicResponse.message);
                        console.log('contactObj: clninc ' + JSON.stringify(this.contactObj));
                        this.showClinicInfoWithSDN = true;
                    }
                    console.log('spermDonorClinicResponse contactObj' + JSON.stringify(this.contactObj));
                }
                else {
                    this.showClinicInfoWithNoSDN = true;
                };


            } else if (donationBasics?.haveIntendedParentDetailsForSperm) {
                this.showRecipientDetails = true;
            } else {
                this.showDonationOutcome = true;
            }
        }

        if (donorType === "egg") {
            const res = await updateDonationCycles({ contactObj: JSON.stringify(this.contactObj) });
            console.log('Res >>>', JSON.stringify(res));
            if (res.isSuccess) {
                let resultObj = JSON.parse(res.message);
                if (resultObj.isChanged) {
                    if (this.contactObj.agenciesWithCodes) {
                        this.contactObj.agenciesWithCodes = {};
                    }
                    if (this.contactObj.agenciesWithoutCode) {
                        this.contactObj.agenciesWithoutCode = [];
                    }
                }
                this.contactObj.allCycles = JSON.parse(resultObj.allCyclesData);
            }
            const result = await updateDonationBasics({ contactObj: JSON.stringify(this.contactObj) });
            console.log('Result >>>', JSON.stringify(result));
            if (!result.isSuccess) return;
            this.showDonationBasics = false;
            if (!this.contactObj.isSkipped && !this.isOptOut) {
                this.showEggAgencyOrBankWithEDN = this.contactObj.donationBasics.egg.workWithAnyAgencyOrEggBank;
                this.showEggClinicWithEDN = this.showEggAgencyOrBankWithEDN ? false : true;
            } else {
                this.showEggAgencyOrBankWithoutEDN = this.contactObj.donationBasics.egg.workWithAnyAgencyOrEggBank;
                this.showEggClinicWithoutEDN = !this.contactObj.donationBasics.egg.workWithAnyAgencyOrEggBank;
            }
        }
    }

    async handleClinicInfoNext(event) {
        this.clinicUserInputWithoutSDN = event.detail;
        this.contactObj = JSON.parse(JSON.stringify(event.detail))
        let result = await createSpermDonorClinic({ donorDetails: JSON.stringify(this.contactObj) })
        if (result.isSuccess) {
            let accMap = {};
            if (result.clinicNumberToAccountId) {
                accMap = result.clinicNumberToAccountId;
            }

            let junctionMap = {};
            if (result.clinicNumberToJunctionId) {
                junctionMap = result.clinicNumberToJunctionId;
            }

            this.contactObj = JSON.parse(JSON.stringify(event.detail))
            this.contactObj['clinics'].forEach(item => {
                item.accountId = accMap[item.clinicNumber] || item.accountId;
                item.junctionId = junctionMap[item.clinicNumber] || item.junctionId;
            });
            this.showClinicInfoWithNoSDN = false
            if (this.contactObj.donationBasics.sperm.haveIntendedParentDetailsForSperm) {
                this.showRecipientDetails = true;
            }
            else {
                this.showDonationOutcome = true;
            }
        }
    }

    handleClinicInfoBack(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail))
        this.showClinicInfoWithNoSDN = false;
        let codes = this.contactObj['codes'];
        //this.showSpermBankInfoWithSDN = true;
        if (this.donorType == 'sperm') {
            let donationBasicsControlPanel = this.contactObj['donationBasics'][this.donorType];
            if (donationBasicsControlPanel['workWithAnySpermBank']) {
                if (!this.contactObj['isSkipped'] && this.isOptOut == false && this.bypassStep == false) {
                    this.showSpermBankInfoWithSDN = true;
                }
                else {
                    this.showSpermBankInfo = true;
                }

            }
            else {
                this.showDonationBasics = true;
            }
        }
        //this.showSpermBankInfo = true;
    }

    handleSpermBankInfoWithSDNNext(event) {
        this.showSpermBankInfoWithSDN = false;
        this.contactObj = JSON.parse(JSON.stringify(event.detail))
        //let codes = this.contactObj['codes']
        //  alert('event' + event.detail);
        //   console.log('event' + JSON.stringify(event.detail));
        console.log('contact @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@' + JSON.stringify(this.contactObj))
        //this.showSpermBankInfo = true;
        let donationBasicsControlPanel = this.contactObj['donationBasics'][this.donorType];
        let codes = this.contactObj['codes'];
        if (donationBasicsControlPanel['workWithAnyClinic']) {
            if (!this.contactObj['isSkipped'] && codes && codes.PMC.length > 0 && this.isOptOut == false && this.bypassStep == false) {
                this.showClinicInfoWithSDN = true;
            }
            else {
                this.showClinicInfoWithNoSDN = true;
            }
        }
        else {
            if (donationBasicsControlPanel['haveIntendedParentDetailsForSperm']) {
                this.showRecipientDetails = true;
            }
            else {
                this.showDonationOutcome = true;
            }
        }
        // this.showClinicInfoWithNoSDN = true;
    }

    handleSpermBankInfoWithSDNBack() {
        this.showSpermBankInfoWithSDN = false;
        this.showDonationBasics = true;
    }

    handleClinicInfoWithSDNBack(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail))
        this.showClinicInfoWithSDN = false;
        let donationBasicsControlPanel = this.contactObj['donationBasics'][this.donorType];
        if (donationBasicsControlPanel['workWithAnySpermBank']) {
            if (!this.contactObj['isSkipped'] && this.isOptOut == false && this.bypassStep == false) {
                this.showSpermBankInfoWithSDN = true;
            }
            else {
                this.showSpermBankInfo = true;
            }
        }
        else {
            this.showDonationBasics = true;
        }
    }

    handleClinicInfoWithSDNNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        let addionalbanksList = this.contactObj['clinicInfoWithSDN']['additionalBanks'];
        this.contactObj['clinicInfoWithSDN']['additionalBanks'] = [...addionalbanksList];



        console.log('FROM handleClinicInfoWithSDNNext @@@@@@' + JSON.stringify(this.contactObj))
        this.showClinicInfoWithSDN = false;
        let donationBasicsControlPanel = this.contactObj['donationBasics'][this.donorType];
        if (donationBasicsControlPanel['haveIntendedParentDetailsForSperm']) {
            this.showRecipientDetails = true;
        }
        else {
            this.showDonationOutcome = true;
        }

    }

    async handleSpermBankInfoNext(event) {
        try {
            this.contactObj = JSON.parse(JSON.stringify(event.detail));
            console.log('>>> conact >>>' + JSON.stringify(this.contactObj));
            let result = await createSpermBank({ donorDetails: JSON.stringify(this.contactObj) })
            if (result.isSuccess) {
                this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
                let accMap = {};
                if (result.clinicNumberToAccountId) {
                    accMap = result.clinicNumberToAccountId;
                }

                let junctionMap = {};
                if (result.clinicNumberToJunctionId) {
                    junctionMap = result.clinicNumberToJunctionId;
                }

                this.contactObj['spermBanks'].forEach(item => {
                    item.accountId = accMap[item.clinicNumber] || item.accountId;
                    item.junctionId = junctionMap[item.clinicNumber] || item.junctionId;
                });
                this.showSpermBankInfo = false;
                let codes = this.contactObj['codes'];
                if (this.contactObj.donationBasics.sperm.workWithAnyClinic) {
                    if (!this.contactObj['isSkipped'] && codes && codes.PMC.length > 0 && this.isOptOut == false && this.bypassStep == false) {
                        this.showClinicInfoWithSDN = true;
                    }
                    this.showClinicInfoWithNoSDN = true;
                }
                else {
                    if (this.contactObj.donationBasics.sperm.haveIntendedParentDetailsForSperm) {
                        this.showRecipientDetails = true;
                    }
                    else {
                        this.showDonationOutcome = true;
                    }
                }
            }
        }
        catch (e) {
            console.log(e.stack)
            console.log(e.message)
        }
    }

    handleSpermBankInfoBack(event) {
        try{
            this.contactObj = JSON.parse(JSON.stringify(event.detail));
            this.showSpermBankInfo = false;
            this.showDonationBasics = true;
        }
          catch(e){
                console.log('main >>>')
                console.log(e.stack);
                console.log(e.message);
            }
    }

    async handleRecipientDetailsNext(event) {
        this.recipientUserInfoWithoutSDN = event.detail;
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        let result = await createSpermDonorRecipients({ RecipientDetails: JSON.stringify(this.contactObj) })
        console.log('Result **** ' + JSON.stringify(result));
        if (result.isSuccess) {
            let accMap = {};
            if (result.recipientNumberToAccountId) {
                accMap = result.recipientNumberToAccountId;
            }
            let conmap = {};
            if (result.recipientNumberToContactId) {
                conmap = result.recipientNumberToContactId;
            }

            let junctionMap = {};
            if (result.recipientNumberToJunctionId) {
                junctionMap = result.recipientNumberToJunctionId;
            }

            console.log('accMap >>> ' + JSON.stringify(accMap));
            console.log('conmap >>> ' + JSON.stringify(conmap));
            console.log('junctionMap >>> ' + JSON.stringify(junctionMap));
            console.log('Recipientd Befroe >>> ' + JSON.stringify(this.contactObj['recipients']));

            this.contactObj['recipients'].forEach(item => {
                item.accountId = accMap[item.RecipientNumber] || item.accountId;
                item.junctionId = junctionMap[item.RecipientNumber] || item.junctionId;
                item.contactId = conmap[item.RecipientNumber] || item.contactId;
            });
            console.log('Recipientd After >>> ' + JSON.stringify(this.contactObj['recipients']));

            this.showRecipientDetails = false;
            this.showDonationOutcome = true;
        }

    }

    handleRecipientDetailsBack(event) {
        try {
            this.contactObj = JSON.parse(JSON.stringify(event.detail))
            let codes = this.contactObj['codes'];
            this.showRecipientDetails = false;
            if (this.donorType == 'sperm') {
                let donationBasicsControlPanel = this.contactObj['donationBasics'][this.donorType];
                if (donationBasicsControlPanel['workWithAnyClinic']) {
                    if (!this.contactObj['isSkipped'] && codes && codes.PMC.length > 0 && this.isOptOut == false && this.bypassStep == false) {
                        this.showClinicInfoWithSDN = true;
                    }
                    else {
                        this.showClinicInfoWithNoSDN = true;
                    }
                }
                else {
                    if (donationBasicsControlPanel['workWithAnySpermBank']) {
                        if (!this.contactObj['isSkipped'] && this.isOptOut == false && this.bypassStep == false) {
                            this.showSpermBankInfoWithSDN = true;
                        }
                        else {
                            this.showSpermBankInfo = true;
                        }
                    }
                    else {
                        this.showDonationBasics = true;
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
            console.log(e.stack);
            console.log(e.message);
        }
    }


    handleDonationOutcomeBack(event) {
        try {
            this.showDonationOutcome = false;
            this.contactObj = JSON.parse(JSON.stringify(event.detail))
            if (this.donorType == 'sperm') {
                let donationBasicsControlPanel = this.contactObj['donationBasics'][this.donorType];
                let codes = this.contactObj['codes'];
                //this.donationOutcomeUserInputObj = event.detail;
                if (donationBasicsControlPanel['haveIntendedParentDetailsForSperm']) {
                    this.showRecipientDetails = true;
                }
                else {
                    if (donationBasicsControlPanel['workWithAnyClinic']) {
                        if (!this.contactObj['isSkipped'] && codes && codes.PMC.length > 0 && this.isOptOut == false && this.bypassStep == false) {//) {
                            this.showClinicInfoWithSDN = true;
                        }
                        else {
                            this.showClinicInfoWithNoSDN = true;
                        }
                        //this.showClinicInfoWithNoSDN = true;
                    }
                    else {
                        if (donationBasicsControlPanel['workWithAnySpermBank']) {
                            //this.showSpermBankInfo = true;
                            if (!this.contactObj['isSkipped'] && this.isOptOut == false && this.bypassStep == false) {
                                this.showSpermBankInfoWithSDN = true;
                            }
                            else {
                                this.showSpermBankInfo = true;
                            }
                        }
                        else {
                            this.showDonationBasics = true;
                        }
                    }
                }
            }
        }
        catch (e) {
            console.log('error' + e);
            console.log(e.stack);
            console.log(e.message);

        }
        /*else if (this.donorType == 'egg') {
            this.showEggAttorneyWithEDN = true;
        }*/
    }

    async handleDonationOutcomeNext(event) {
        this.donationOutcomeUserInputObj = event.detail;
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        //let result = await createSpermDonorDonationOutcome({ donationOutcomeDetails: JSON.stringify(this.donationOutcomeUserInputObj), donorId: this.contactId })
        let result = await createSpermDonorDonationOutcome({ donationOutcomeDetails: JSON.stringify(this.contactObj) })
        if (result.isSuccess) {
            this.showDonationOutcome = false;
            this.showHippaScreen = true;
        }

    }

    handleMatchVerificationBack() {
        this.showMatchVerification = false;
        this.showHippaSign = true;
    }
     handleAgeVerificationBack(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showAgeVerification = false;
        this.showGetStarted = true;
        this.bypassStep = false
    }


    handleCodeSubmissionBack(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showCodeSubmission = false;
        this.showAgeVerification = true;
        this.bypassStep = false
    }

    handleAgeVerificationNext(event){
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        alert('In')
    }



    async handleCodeSubmissionNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.bypassStep = false;
        if (!this.contactObj['isSkipped']) {
            let result = await validateCodeSubmission({ contactObj: JSON.stringify(this.contactObj) });
            console.log('validateCodeSubmission >>> ' + JSON.stringify(result))
            if (result.isSuccess) {
                this.contactObj['noMatchCodesList'] = JSON.parse(result.message);
                this.showCodeError = this.contactObj['noMatchCodesList'].length;
                this.showCodeSubmission = false;
                if (!this.showCodeError) {
                    let emailMatchResult = await verifyGivenCodesEmail({ contactObj: JSON.stringify(this.contactObj) });
                    console.log('verifyGivenCodesEmail >>> ' + verifyGivenCodesEmail);
                    if (emailMatchResult.isSuccess) {
                        this.showDonationBasics = true;
                        this.showErrorCodeSubmission = false;
                    }
                    else {
                        this.showErrorCodeSubmission = true;
                        this.showDonationBasics = false;
                    }
                }
            }
        }
        else {
            this.showCodeError = false;
            this.showDonationBasics = true;
            this.showCodeSubmission = false;
        }
    }

    handleMatchVeriyBack(event) {
        this.showHippaSign = true;
        this.showMatchVerification = false;
    }

    handleHippbBackClick(event) {
        this.showHippaScreen = false
        this.showDonationOutcome = true;
    }

    handleHippsignbBackClick(event) {
        this.showHippaSign = false
        this.showHippaScreen = true;
    }

    handleHippbNextClick(event) {
        this.showHippaScreen = false
        this.showHippaSign = true;
    }

    handleHippsignbNextClick(event) {
        this.showHippaScreen = false
        this.showMatchVerification = true;
    }

    async handleErrorCodeSubmissionNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.bypassStep = false;
        this.showErrorCodeSubmission = false;
        console.log('Handle Error Code Submission >>> ' + JSON.stringify(this.contactObj))
        if (this.contactObj['alternateDetails'].isOptOut) {
            this.showDonationBasics = true;
        }
        else {
            let otpResult = await sendOTPToEmailOrPhone({ contactObj: JSON.stringify(this.contactObj), isOtpType: false });
            this.isTwoFactor = true;
        }
    }

    handleErrorCodeSubmissionBack(event) {
        this.showErrorCodeSubmission = false;
        this.showCodeSubmission = true;
        this.bypassStep = false;
    }

    handleDonorHippaBack(event) {
       // alert('Test Hippa Back')
        // this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showHippaScreen = false;
        if (this.donorType == 'sperm') {
            this.showDonationOutcome = true;
        }
        else if (this.donorType == 'egg') {
            this.showEggCycleOutcome = true;
        }
    }

    handleDonorHippasignBack(event) {
        this.showHippaSign = false;
        this.showHippaScreen = true;
        //alert('Hipp Back' + event.detail)
    }
    errorCallback(error, stack) {
        console.log('errorcallback - grandparent' + error);
        console.log(stack);
    }

    async handleDonorHippaNext(event) {
        //alert('Test Back')
       //  this.contactObj = JSON.parse(JSON.stringify(event.detail));
         //let result = await getRelatedRecords({ contactId : this.contactObj.donorId,donorType : this.contactObj.donorType });
        // console.log('Result >> ' + JSON.stringify(result));
        this.showHippaScreen = false;
        this.showHippaSign = true;
    }

    async handleDonorHippasignNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
          let result = await getRelatedRecords({ contactObj: JSON.stringify(this.contactObj) });
          if(result.isSuccess && result.message){
            this.contactObj['DonorCodeSpecial'] = result.message;
          }
          console.log('Result >> ' + JSON.stringify(result));
        this.showHippaSign = false;
        this.showMatchVerification = true;
    }

    handleCodeErrorBack() {
        this.showCodeError = false;
        this.showCodeSubmission = true;
        this.bypassStep = false;
    }

    async handleCodeErrorNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        //alert(this.contactObj['bypassStep'])
        /**added this if condition only to bypass  */
        if (this.contactObj && this.contactObj['bypassStep'] == true) {
            this.bypassStep = true;
            this.showDonationBasics = true;
            this.showErrorCodeSubmission = false;
            this.showCodeError = false;
            //this.isOptOut = true;
        }
        else {
            this.bypassStep = false;
            //this.isOptOut = false;
            console.log('Code Error >>> ' + JSON.stringify(this.contactObj));
            let result = await verifyReEnterCodes({ contactObj: JSON.stringify(this.contactObj) })
            if (result.isSuccess && result.message) {
                this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
                let oldCodes = this.contactObj.noMatchCodesList;
                let allMatchedCodes = [
                    ...this.contactObj.newCodeList,
                    ...this.contactObj.codes.PMC,
                    ...this.contactObj.codes.EDN,
                    ...this.contactObj.codes.SDN,
                    ...this.contactObj.codes.EMB,
                    ...this.contactObj.codes.REC
                ];
                let uniqueCodes = [...new Set(allMatchedCodes)];
                let finalCodes = uniqueCodes.filter(code => !oldCodes.includes(code));
                let codesList = { PMC: [], EDN: [], SDN: [], EMB: [], REC: [] };
                for (let code of finalCodes) {
                    if (code.startsWith('PMC')) {
                        codesList['PMC'].push(code);
                    }
                    else if (code.startsWith('EDN')) {
                        codesList['EDN'].push(code);
                    }
                    else if (code.startsWith('SDN')) {
                        codesList['SDN'].push(code);
                    }
                    else if (code.startsWith('EMB')) {
                        codesList['EMB'].push(code);
                    }
                    else if (code.startsWith('REC')) {
                        codesList['REC'].push(code);
                    }
                }
                this.contactObj['codes'] = codesList;
                this.contactObj['finalCodes'] = finalCodes;
                this.showCodeError = false;
                let emailMatchResult = await verifyGivenCodesEmail({ contactObj: JSON.stringify(this.contactObj) });
                console.log('emailMatchResult >>> ' + JSON.stringify(emailMatchResult));
                if (emailMatchResult.isSuccess) {
                    this.showDonationBasics = true;
                    this.showErrorCodeSubmission = false;
                }
                else {
                    this.showErrorCodeSubmission = true;
                }
            }
        }
    }

    handleMatchVerificationNext() {
        this.showMatchVerification = false;
        this.showEggAgencyOrBankWithoutEDN = true;
    }

    handleEggAgencyNext() {
        this.showEggAgencyOrBankWithoutEDN = false;
        this.showEggClinicWithoutEDN = true;
    }

    handleEggAgencyBack() {
        this.showEggAgencyOrBankWithoutEDN = false;
        this.showMatchVerification = true;
    }

    handleEggClinicNext() {
        this.showEggAttorneyWithoutEDN = true;
        this.showEggClinicWithoutEDN = false;
    }

    handleEggAgencyWithEDNNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail))
        this.showEggAgencyOrBankWithEDN = false;
        this.showEggClinicWithEDN = true;
    }

    handleEggAgencyWithEDNBack(event) {
        this.showEggAgencyOrBankWithEDN = false;
        this.showDonationBasics = true;
        this.eggDonorAgencyUserInputWithCode = event.detail
    }

    async handleEggAgencyOrBankWithoutEDNNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        console.log('this.contactObj >>> '+ JSON.stringify(this.contactObj))
        let result = await updateAgencyWithoutCode({ contactObj: JSON.stringify(this.contactObj) })
        console.log('result >>> ' + JSON.stringify(result));
        if (result.isSuccess) {
            console.log('Merge Before >>> ' + JSON.stringify(JSON.parse(result.message)))
            this.contactObj['agenciesWithoutCode'] = JSON.parse(result.message);
            this.showEggAgencyOrBankWithoutEDN = false;
            this.showEggClinicWithoutEDN = true;
            console.log('Merge After >>> ' + JSON.stringify(this.contactObj['agenciesWithoutCode']))
        }
    }

    handleEggAgencyOrBankWithoutEDNBack(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showEggAgencyOrBankWithoutEDN = false;
        this.showDonationBasics = true;
    }

    handleEggClinicWithEDNNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showEggClinicWithEDN = false;
        if (this.contactObj.donationBasics.egg.workWithAttorney) {
            this.showEggAttorneyWithEDN = true;
            this.showEggRecipientScreen = false;
            this.showEggCycleOutcome = false;
        }
        else if (this.contactObj.donationBasics.egg.haveIntendedParentDetails) {
            this.showEggRecipientScreen = true;
            this.showEggAttorneyWithEDN = false;
            this.showEggCycleOutcome = false;
        }
        else {
            this.showEggCycleOutcome = true;
            this.showEggRecipientScreen = false;
            this.showEggAttorneyWithEDN = false;
        }
    }

    handleEggClinicWithEDNBack(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showEggClinicWithEDN = false;
        if (this.contactObj.donationBasics.egg.workWithAnyAgencyOrEggBank) {
            this.showEggAgencyOrBankWithEDN = true;
        }
        else {
            this.showDonationBasics = true;
        }
    }

    async handleEggClinicWithoutEDNNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        console.log('updateClinicWithoutCode >>> ' + JSON.stringify(this.contactObj));
        this.showEggClinicWithoutEDN = false;
        let result = await updateClinicWithoutCode({ contactObj: JSON.stringify(this.contactObj) })
        console.log(JSON.stringify(result));
        console.log('updateClinicWithoutCode Updated >>> ' + JSON.stringify(this.contactObj));
        if (result.isSuccess) {
            this.contactObj['clinicsWithoutCode'] = JSON.parse(result.message);
            let donationBasicsControlPanel = this.contactObj['donationBasics'][this.donorType];
            if (donationBasicsControlPanel['workWithAttorney']) {
                this.showEggAttorneyWithoutEDN = true;
            }
            else {
                if (donationBasicsControlPanel['haveIntendedParentDetails']) {
                    this.showEggRecipientScreen = true;
                }
                else {
                    this.showEggCycleOutcome = true;
                }
            }
        }
    }

    handleEggClinicWithoutEDNBack(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showEggClinicWithoutEDN = false;
        if (this.contactObj.isSkipped) {
            if (this.contactObj.donationBasics.egg.workWithAnyAgencyOrEggBank) {
                this.showEggAgencyOrBankWithoutEDN = true;
            }
            else {
                this.showDonationBasics = true;
            }
        }
    }

    async handleEggFertilityAttorneyWithoutEDNNext(event) {
        try {
            this.contactObj = JSON.parse(JSON.stringify(event.detail));
            let result = await updateAttorneyWithoutCode({ contactObj: JSON.stringify(this.contactObj) })
            console.log('Result >>> ' + JSON.stringify(result));
            console.log('Final Result >>>> ' + JSON.stringify(this.contactObj));
            if (result.isSuccess) {
                this.contactObj['AttorniesWithoutCode'] = JSON.parse(result.message);
                console.log(JSON.stringify(this.contactObj))
                this.showEggAttorneyWithoutEDN = false;
                this.showEggRecipientScreen = true;
            }
        }
        catch (e) {
            console.log('error');
            console.log(e.message);
            console.log(e.stack)
        }
    }

    handleEggFertilityAttorneyWithoutEDNBack(event) {
        try {
            this.contactObj = JSON.parse(JSON.stringify(event.detail));
            this.showEggAttorneyWithoutEDN = false;
            this.showEggClinicWithoutEDN = true;
        }
        catch (e) {
            console.log('error');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleEggAttorneyWithEDNNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showEggAttorneyWithEDN = false;
        if (this.contactObj.donationBasics.egg.haveIntendedParentDetails) {
            this.showEggRecipientScreen = true;
        }
        else {
            this.showEggCycleOutcome = true;
        }
    }

    handleEggAttorneyWithEDNBack(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showEggAttorneyWithEDN = false;
        this.showEggClinicWithEDN = true;
    }

    handleEggCycleOutcomeNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showEggCycleOutcome = false;
        this.showHippaScreen = true;
    }

    handleEggCycleOutcomeBack(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showEggCycleOutcome = false;
        if (this.contactObj.donationBasics.egg.haveIntendedParentDetails) {
            this.showEggRecipientScreen = true;
        }
        else if (this.contactObj.donationBasics.egg.workWithAttorney) {
            this.showEggAttorneyWithEDN = true;
        }
        else {
            this.showEggClinicWithoutEDN = true;
        }

        // this.showEggAttorneyWithoutEDN = true;
        // this.eggCycleOutComeUserInput = event.detail;
    }

    handleEggRecipientBack(event) {
        try {
            this.contactObj = JSON.parse(JSON.stringify(event.detail));
            this.showEggRecipientScreen = false;
            if (!this.contactObj.isSkipped && !this.isOptOut) {
                if (this.contactObj.donationBasics.egg.workWithAttorney) {
                    this.showEggAttorneyWithEDN = true;
                }
                else {
                    this.showEggClinicWithEDN = true;
                }
            }
            else {
                if (this.contactObj.donationBasics.egg.workWithAttorney) {
                    this.showEggAttorneyWithoutEDN = true;
                }
                else {
                    this.showEggClinicWithoutEDN = true;
                }
            }
        }
        catch (e) {
            console.log(e.stack);
            console.log(e.message);
        }
    }

    async handleEggRecipientNext(event) {
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        let result = await updateRecipientWithoutCode({ contactObj: JSON.stringify(this.contactObj) })
        console.log('Result >>> ' + JSON.stringify(result));
        if (result.isSuccess) {
            console.log('Test ENtede')
            this.showEggRecipientScreen = false;
            this.showEggCycleOutcome = true;
        }
    }

    get currentStepName() {
        if (this.showGetStarted) {
            return 'getstarted';
        } else if (this.isTwoFactor) {
            return 'securityverification';
        } else if (this.showCodeSubmission || this.showErrorCodeSubmission || this.showCodeError) {
            return 'codesubmission';
        } else if (this.showEggAgencyOrBankWithEDN || this.showEggAgencyOrBankWithoutEDN) {
            return 'agencyInfo';
        } else if (this.showDonationBasics) {
            return 'donationbasics';
        } else if (this.showSpermBankInfoWithSDN || this.showSpermBankInfo) {
            return 'bankinfo';
        } else if (this.showEggAttorneyWithoutEDN || this.showEggAttorneyWithEDN) {
            return 'fertilityAttorney';
        } else if (this.showClinicInfoWithNoSDN || this.showClinicInfoWithSDN || this.showEggClinicWithEDN || this.showEggClinicWithoutEDN) {
            return 'clinicinfo';
        } else if (this.showRecipientDetails) {
            return 'recipientInfo';
        } else if (this.showDonationOutcome || this.showEggCycleOutcome) {
            return 'donationOutcome';
        } else if (this.showHippaScreen) {
            return 'hippaPrep';
        } else if (this.showHippaSign) {
            return 'hippasign';
        } else if (this.showMatchVerification) {
            return 'matchVerification';
        } else {
            return 0;
        }
    }

    get progressValue() {
        switch (this.currentStepName) {
            case 'getstarted':
                this.stepnumber = 1;
                this.currentMobileStepName = 'Get Started';
                return 10;

            case 'securityverification':
                this.stepnumber = 2;
                this.currentMobileStepName = 'Security Verification';
                return 20;

            case 'codesubmission':
                this.stepnumber = 3;
                this.currentMobileStepName = 'Code Submission';
                return 30;

            case 'donationbasics':
                this.stepnumber = 4;
                this.currentMobileStepName = 'Donation Basics';
                return 40;

            case 'bankinfo':
                this.stepnumber = 5;
                this.currentMobileStepName = 'Bank Info';
                return 50;

            case 'fertilityAttorney':
                this.stepnumber = 5;
                this.currentMobileStepName = 'Fertility Attorney';
                return 55;

            case 'clinicinfo':
                this.stepnumber = 6;
                this.currentMobileStepName = 'Clinic Info';
                return 60;

            case 'recipientInfo':
                this.stepnumber = 7;
                this.currentMobileStepName = 'Recipient Info';
                return 70;

            case 'donationOutcome':
                this.stepnumber = 8;
                this.currentMobileStepName = 'Donation Outcome';
                return 80;

            case 'hippaPrep':
                this.stepnumber = 9;
                this.currentMobileStepName = 'HIPAA Release';
                return 90;

            case 'hippaSign':
                this.stepnumber = 10;
                this.currentMobileStepName = 'HIPAA Sign';
                return 90;

            case 'matchVerification':
                this.stepnumber = 11;
                this.currentMobileStepName = 'Match Verification';
                return 100;

            case 'agencyInfo':
                this.stepnumber = 5;
                this.currentMobileStepName = 'Agency Info';
                return 55;

            default:
                this.stepnumber = 0;
                this.currentMobileStepName = '';
                return 0;
        }
    }

    handleEggHipaaNext(event){
        this.contactObj = JSON.parse(JSON.stringify(event.detail));
        this.showEggHipaa = false;
        this.showHippaSign = true;

    }

}