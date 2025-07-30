import { LightningElement, track, api } from 'lwc';
import deleteSpermBank from '@salesforce/apex/SpermDonorPreRegistrationController.deleteSpermBank';


export default class SpermBankDetails extends LightningElement {
    @track spermBanks = [
        {
            id: Date.now(),
            clinicNumber: 1,
            clinicHeading: '',
            name: '',
            website: '',
            phone: '',
            email: '',
            coordinator: '',
            knowDonorCode: '',
            donorCode: '',
            showDonorCodeInput: false,
            accountId : '',
            junctionId : ''
        }
    ];
    @track loadSpinner = false;
    //@track showNumberedHeadings = false;
    @track noSpermBankChecked = false;
    @track showDeletePopup = false;
    @track deleteIndex = null;
    @track deleteSpermBankNumber = null;
    @api spermBankUserInputWithoutSDN;
    @api contactObj;

    donorCodeOptions = [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
    ];

    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        if(this.contactObj &&  this.contactObj['spermBanks'] && this.contactObj['spermBanks'].length > 0){
            this.spermBanks = this.contactObj['spermBanks'].map((bank, index) => {
                return {
                    ...bank,
                    clinicNumber: index + 1,
                    knowDonorCode : bank.knowDonorCode
                };
            });
            //alert()
            this.noSpermBankChecked = this.spermBanks[0]['noSpermBankCheckedDisableInputs']
            console.log(JSON.stringify(this.spermBanks));
        }
    }

    get disableAddAnotherSpermBank() {
        let clsName = 'textcls addagencycls inputscls';
        if (this.noSpermBankChecked) {
            clsName += ' disableAddAnotherClickCls';
        }
        return clsName;
    }

    get checkboxStatus() {
        return this.spermBanks.length > 1;
        //return true;
    }

    handleNoSpermBankChange(event) {
        this.noSpermBankChecked = event.target.checked;
        if (this.noSpermBankChecked) {
            this.spermBanks[0] = {
                ...this.spermBanks[0],
                name: '',
                website: '',
                phone: '',
                email: '',
                coordinator: '',
                knowDonorCode: '',
                donorCode: '',
                showDonorCodeInput: false,
                accountId : '',
                junctionId : ''
            };
        }
        this.spermBanks = [...this.spermBanks];
    }

    handleInputChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.name;
        this.spermBanks = this.spermBanks.map(bank => 
            bank.id === this.spermBanks[index].id
                ? { ...bank, [field]: event.target.value }
                : bank
        );
        const input = event.target;
        if (input.validity.valid) {
            input.setCustomValidity('');
            input.reportValidity();
        }
    }

    handleInputBlur(event) {
        const input = event.target;
        const fieldName = input.name;
        const value = input.value;
        const fieldsMap = new Map([
            ['name', 'Please enter sperm bank name']
            // ['website', 'Please enter website'],
            // ['phone', 'Please enter phone number'],
            // ['email', 'Please enter email'],
            // ['coordinator', 'Please enter coordinator name'],
            // ['donorCode', 'Please enter donor code']
        ]);

        if (fieldsMap.has(fieldName)) {
            if (value === '' && (!this.noSpermBankChecked || fieldName !== 'donorCode' || this.spermBanks[event.target.dataset.index].knowDonorCode === 'Yes')) {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        }
    }

    handleDonorCodeChange(event) {//knowDonorCode
        const index = parseInt(event.target.dataset.index, 10);
        const value = event.target.value;
        
        this.spermBanks = this.spermBanks.map(bank => 
            bank.id === this.spermBanks[index].id
                ? { 
                    ...bank, 
                    knowDonorCode: value, 
                    showDonorCodeInput: value === 'Yes',
                    donorCode: value === 'No' ? '' : bank.donorCode
                }
                : bank
        );
        console.log(JSON.stringify( this.spermBanks));
    }

    handleAddAnotherClick() {
        this.loadSpinner = false;
        //this.showNumberedHeadings = true;
        this.noSpermBankChecked = false;
        this.spermBanks.push({
            id: Date.now(),
            clinicNumber: this.spermBanks.length + 1,
            clinicHeading: '',
            name: '',
            website: '',
            phone: '',
            email: '',
            coordinator: '',
            knowDonorCode: '',
            donorCode: '',
            showDonorCodeInput: false
        });
        /*this.spermBanks = this.spermBanks.map((bank, i) => ({
            ...bank,
            clinicNumber: i + 1,
            clinicHeading: ''
        }));*/
        this.spermBanks = [... this.spermBanks];
        console.log(JSON.stringify(this.spermBanks))
        /*setTimeout(() => {
            this.loadSpinner = false;
        }, 3000);*/
    }

    handleDeleteConfirm(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const spermBank = this.spermBanks.find(bank => bank.id === this.spermBanks[index].id);
        this.deleteIndex = index;
        this.deleteSpermBankNumber = spermBank ? spermBank.clinicNumber : null;
        this.showDeletePopup = true;
    }

    get  showNumberedHeadings(){
        let result = false;
        if(this.spermBanks.length > 1){
            result = true;
        }
        return result;
    }

    async handleDeleteYes() {
        const index = this.deleteIndex;
        if(this.spermBanks[index].accountId){
            let resultData = await deleteSpermBank({ spermbankId: this.spermBanks[index].accountId }); 
            //alert('Delete Agency >>> ' + JSON.stringify(resultData));
            if (resultData.isSuccess) {
            }
        }

        this.spermBanks = this.spermBanks.filter((_, i) => i !== index);
        this.spermBanks = this.spermBanks.map((bank, i) => ({
            ...bank,
            clinicNumber: i + 1,
            clinicHeading: this.spermBanks.length === 1 ? 'Sperm Bank Details' : ''
        }));
       // this.showNumberedHeadings = this.spermBanks.length > 1;
        if (this.spermBanks.length === 1) {
            this.noSpermBankChecked = false;
        }
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteSpermBankNumber = null;
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteSpermBankNumber = null;
    }

    handleSpermBankInfoNext() {
        try{
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
            if (this.noSpermBankChecked) {
                this.spermBanks[0]['noSpermBankChecked'] = true;
                this.contactObj['spermBanks'] = this.spermBanks;
                console.log('contact');
                console.log(JSON.stringify(this.contactObj));
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
               
            }

            let isValid = true;
            this.template.querySelectorAll('lightning-input').forEach(input => {
                const fieldName = input.name;
                const value = input.value;
                const fieldsMap = new Map([
                    ['name', 'Please enter sperm bank name'],
                    ['donorCode', 'Please enter donor code']
                   // ['website', 'Please enter website'],
                    // ['phone', 'Please enter phone number'],
                    // ['email', 'Please enter email'],
                    // ['coordinator', 'Please enter coordinator name'],
                    // ['donorCode', 'Please enter donor code']
                ]);

                if (fieldsMap.has(fieldName)) {
                    if (value === '' && (!this.noSpermBankChecked  || this.spermBanks[input.dataset.index].knowDonorCode === 'Yes')) {
                        input.setCustomValidity(fieldsMap.get(fieldName));
                        input.reportValidity();
                        isValid = false;
                    }
                     else {
                        input.setCustomValidity('');
                        input.reportValidity();
                    }
                }
               

            });

            let inputValidityList = [];
            this.template.querySelectorAll('.donorcodeinputcls').forEach(input => {
                if (input.classList.contains('slds-has-error')) {
                    inputValidityList.push('Error class is present');
                }
            })
            console.log('inputValidityList' + JSON.stringify(inputValidityList));

            if (isValid && inputValidityList.length == 0) {
                this.spermBanks[0]['noSpermBankChecked'] = false;
                this.spermBanks[0]['noSpermBankCheckedDisableInputs'] =  this.noSpermBankChecked;
                this.contactObj['spermBanks'] = this.spermBanks
                console.log('contact');
                console.log(JSON.stringify(this.contactObj));
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
            }

           
        }
        catch(e){
            console.log('error >>')
            console.log(e.message)
            console.log(e.stack)
        }
    }

    handleSpermBankInfoBack() {
        this.contactObj['spermBanks'] = this.spermBanks
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }
}