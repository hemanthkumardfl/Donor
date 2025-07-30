import { LightningElement, track, api } from 'lwc';
import SECURITY_LOGO from '@salesforce/resourceUrl/Security_LOGO';
import SECURITY_MOBILE_LOGO from '@salesforce/resourceUrl/SecurityMobileIcon';
import SECURITY_ERROR_LOGO from '@salesforce/resourceUrl/SecurtityVerificationErrorIcon';
import HAVING_TROUBLE_LOGO from '@salesforce/resourceUrl/TroubleIcon';
let validateTimeInterval;
export default class DonorPreRegSecurityVerification extends LightningElement {

    @track Security_LOGO = SECURITY_LOGO;
    @track SecurityMobileIcon = SECURITY_MOBILE_LOGO;
    @track havingTroubleIcon = HAVING_TROUBLE_LOGO;
    @track securityErrorLogo = SECURITY_ERROR_LOGO;

    @track inputEntry = { 'one': null, 'two': null, 'three': null, 'four': null, 'five': null, 'six': null };
    @track userDetails = { 'firstName': null, 'email': null }
    @track validTime = 30;
    @track otpValidation = '';
    @api isValidationError;
    @track otp;

    @track isFocus = false; 
    @track disableMessage = false;
    @api contactObj;

    handleTimeInterval() {
        validateTimeInterval = setInterval(() => {
            this.validTime--
            this.validTime == 0 || isNaN(this.validTime) ? this.handleClear() : null;
            this.validTime < 10 ? this.validTime = '0' + this.validTime : this.validTime;
            let message = this.validTime == 0 ? 'You can request a new code' : 'You may request a new code in 00 : ' + this.validTime;
            this.otpValidation = message;
            // if (this.validTime == 0) {
            //     this.dispatchEvent(new CustomEvent('deleteotpcode'));
            // }
        }, 1000);
    }

    connectedCallback() {
        this.handleTimeInterval();
    }

    get securitydescription() {
        let msg = 'Your safety matters to us. We just sent a six digit security code to your email and phone. Please enter it below to verify your account.';
        if (this.isValidationError) {
            msg = 'The code that you entered doesn\'t match our records. To process, please re-enter the code.';
        }
        return msg;
    }

    get securityverification() {
        let msg = 'Security Verification';
        if (this.isValidationError) {
            msg = 'Error !';
        }
        return msg
    }

    get styleInfo() {
        let msg = 'color:black';
        if (this.isValidationError) {
            msg = 'color:rgb(196, 48, 31)';
        }
        return msg;
    }


    get otpValidationMasg() {
        this.validTime < 10 ? this.validTime = '0' + this.validTime : this.validTime;
        let message = this.validTime == 0 ? 'You can request a new code' : 'You may request a new code in 00 : ' + this.validTime;
        return message;
    }


    handleDisableMessageClass() {
        setTimeout(() => {
            this.disableMessage = true;
        }, 1200)

    }

    get otpMsgClass() {
        let classname = "messagecls validationmsgcls"
        return classname;
    }

    get verifyButtonClass() {
        let classname = "btndivcls slds-p-around_x-small slds-text-align_center";
        return classname;
    }

    get resendButtonClass() {
        let classname = "resendcls messagecls";
        if (this.validTime > 0) {
            classname += " disabled-span";
        }
        return classname;
    }


    handleResendCodeClick() {
        this.disableMessage = false;
        this.isValidationError = false;
        this.validTime = 30;
        this.otp = '';
        this.inputEntry = { 'one': null, 'two': null, 'three': null, 'four': null, 'five': null, 'six': null };
        this.dispatchEvent(new CustomEvent('resendcode'));
        this.handleTimeInterval()
    }

    handleUserInput(event) {
        const input = event.target;
        const index = parseInt(input.dataset.id, 10);
        const key = input.dataset.objkey;

        if (['e', 'E', '+', '-', '.'].includes(event.key)) {
            event.preventDefault();
        }

        const inputs = this.template.querySelectorAll('.otpinputcls');
        if (event.type === 'input') {
            if (input.value.length > 1) {
                input.value = input.value.slice(0, 1);
            }
            if (input.value !== '' && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
            this.inputEntry[key] = input.value ? input.value : null;
        }
        if (event.key == "Backspace") {
            if (input.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        }
        if (event.key == "Enter") {
            this.handleVerifyclick();
        }
    }

    handleVerifyclick() {
        if (Object.values(this.inputEntry).includes(null)) {
            // alert('Not an valid entry')
        }
        else {
            console.log(JSON.stringify(this.contactObj));
            this.otp = Object.values(this.inputEntry).join('');
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
            this.contactObj['message'] = this.otp;
            console.log(JSON.stringify(this.contactObj));
            this.dispatchEvent(new CustomEvent('verifyotpcode', { detail: this.contactObj }));
        }
    }


    handleClear() {
        clearInterval(validateTimeInterval);
    }

    handleOTPpaste(event) {
        let copiedData = event.clipboardData.getData('text/plain').split("");
        Object.keys(this.inputEntry).forEach((key, index) => {
            this.inputEntry[key] = copiedData[index] ? copiedData[index] : null;
        })
        console.log(JSON.stringify(this.inputEntry));
    }
}