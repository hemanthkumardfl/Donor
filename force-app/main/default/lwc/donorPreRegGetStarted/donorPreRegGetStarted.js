import { LightningElement, api, track } from 'lwc';
import DONOR_PRE_REG_GET_STARTED_LOGO from '@salesforce/resourceUrl/donorPreRegGetStartedLogo';

export default class DonorPreRegGetStarted extends LightningElement {

    @track parentLogo = DONOR_PRE_REG_GET_STARTED_LOGO;
    @track showTermsPopup = false;
    @api contactObj;
    @api userdetails;
    @track contactAlreadyAvailable;
    @api donorType;
    @track showRadioError = false;
    @track showCheckboxError = false;
    @track isVerifiedEmail = false;
    @api emailRadioButton = false;
    @api phoneRadioButton = false;
    @api bothRadioButton = false;

    @api
    verifyEmailHandler(message) {
        const emailInput = this.template.querySelectorAll('lightning-input');
        Array.from(emailInput).forEach(input => {
            if (input.type == 'email' && message.isEmail) {
                input.setCustomValidity('This email address is already in use. Please enter a different email.');
                input.reportValidity();
            }
            if (input.name == 'phone' && message.isPhone) {
                input.setCustomValidity('This Phone is already registered. Please choose a different Phone Number.');
                input.reportValidity();
            }
        })
        console.log('Verify >>> ' + JSON.stringify(this.contactObj))
    }

    connectedCallback() {
        console.log(JSON.stringify(this.contactObj));
        if (!this.contactObj) {
            this.contactObj = { 'firstName': null, 'lastName': null, 'email': null, 'phone': null, 'preferredUserName': null, 'preferredPassword': null, 'verificationType': null, 'terms': false };
            this.contactObj['donorType'] = this.donorType;
        } else {
            this.emailRadioButton = (this.contactObj['verificationType'] == 'Email');
            this.phoneRadioButton = (this.contactObj['verificationType'] == 'Phone');
            this.bothRadioButton = (this.contactObj['verificationType'] == 'Both');
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        }
    }

    handleInputChange(event) {
        let obj = JSON.parse(JSON.stringify(this.contactObj))
        const { name, value, checked, type } = event.target;
        obj[name] = (type === 'checkbox') ? checked : value;
        this.contactObj = obj;
    }

    validateInput(event) {
        const input = event.target;
        let msg = '';
        let labelList = {
            'firstName': 'first name',
            'lastName': 'last name',
            'preferredUserName': 'Preferred Username',
            'preferredPassword': 'Preferred Password',
            'terms': 'Terms and Conditions',
            'verificationType': 'Verification Type'
        }

        switch (input.name) {
            case 'firstName':
            case 'lastName':
                if (!input.value.trim()) {
                    msg = `Enter your ${labelList[input.name]}`;
                }
                break;

            case 'preferredUserName':
                if (!input.value.trim()) {
                    msg = 'Enter a unique username';
                } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input.value)) {
                    msg = 'Enter a valid username';
                }
                break;

            case 'preferredPassword':
                if (!input.value.trim()) {
                    msg = 'Enter a password';
                } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(input.value)) {
                    msg = 'Enter a valid Password';
                }
                break;

            case 'email':
                if (!input.value.trim()) {
                    msg = 'Enter your email address';
                } else if (!/^\S+@\S+\.\S+$/.test(input.value)) {
                    msg = 'Enter a valid email';
                }
                break;

            case 'phone':
                const phoneVal = input.value.trim();
                if (!phoneVal) {
                    msg = 'Enter your phone number';
                } else if (!/^\+\d{1,4}[\s\-().\d]{6,20}$/.test(phoneVal)) {
                    msg = 'Enter a valid phone number with country code, e.g., +19876543210';
                }
                break;
        }

        input.setCustomValidity(msg);
        input.reportValidity();
    }

    handleGetStartedContinue() {
        const allInputs = this.template.querySelectorAll('lightning-input');
        const radioButtons = this.template.querySelectorAll('input[name="radioGroup"]');
        let isValid = true;
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj))
        this.contactObj['donorType'] = (this.donorType == 'egg') ? 'Egg Donor' : (this.donorType == 'sperm') ? 'Sperm Donor' : (this.donorType == 'embryo') ? 'Embryo Donor' : '';
        allInputs.forEach(input => {
            const { type, name, value, checked } = input;

            if (type === 'checkbox') {
                const valid = checked;
                input.setCustomValidity(valid ? '' : ' ');
                input.reportValidity();
                this.showCheckboxError = !valid;
                if (!valid) isValid = false;
                else this.contactObj[name] = checked;
            } else {
                this.validateInput({ target: input });
                if (!input.checkValidity()) {
                    isValid = false;
                    if (input) {
                        input.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    this.contactObj[name] = value;
                }
            }
        });
        const isRadioChecked = Array.from(radioButtons).some(rb => rb.checked);
        this.showRadioError = !isRadioChecked;
        isValid = isValid && isRadioChecked;

        if (isValid) {
            Array.from(radioButtons).forEach(radioButton => {
                if (radioButton.checked) {
                    this.contactObj['verificationType'] = radioButton.value;
                }
            });
            console.log('All fields valid');
            this.contactObj['donorType'] = this.donorType;
            this.dispatchEvent(new CustomEvent('continue', { detail: this.contactObj }));
        }
    }

    handleGetStartedCancel() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        const allInputs = this.template.querySelectorAll('lightning-input');
        const radioButtons = this.template.querySelectorAll('input[name="radioGroup"]');
        allInputs.forEach(input => {
            const { type, name, value, checked } = input;
            if (type === 'checkbox') {
                this.contactObj[name] = checked;
            } else {
                this.contactObj[name] = value;
            }
        });
        Array.from(radioButtons).forEach(radioButton => {
            if (radioButton.checked) {
                this.contactObj['verificationType'] = radioButton.value;
            }
        });
        this.dispatchEvent(new CustomEvent('cancel', { detail: this.contactObj }));
    }

    handleRadioChange(event) {
        let buttonType = event.target.value;
        this.phoneRadioButton = buttonType === 'Phone';
        this.emailRadioButton = buttonType === 'Email';
        this.bothRadioButton = buttonType === 'Both';
        let obj = JSON.parse(JSON.stringify(this.contactObj));
        obj['verificationType'] = event.target.value;
        this.contactObj = obj;
        const radioButtons = this.template.querySelectorAll('input[type="radio"]');
        Array.from(radioButtons).forEach(radioButton => {
            if (!radioButton.checked) {
                radioButton.checked = false;
            }
        });
    }

    handleTermsClick() {
        this.showTermsPopup = true;
    }

    handleOk() {
        this.showTermsPopup = false;
    }

}