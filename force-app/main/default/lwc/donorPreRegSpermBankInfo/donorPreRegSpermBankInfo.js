import { LightningElement, track, api } from 'lwc';
import deleteSpermBank from '@salesforce/apex/SpermDonorPreRegistrationController.deleteSpermBank';
import fetchSpermBankRecord from '@salesforce/apex/UtilityClass.fetchSpermBankRecord';
import createCoordinator from '@salesforce/apex/UtilityClass.createCoordinator';

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
            junctionId : '',
            oldJunctionId : '',
            showNoAccountRecordsErrorMessage :false,
            disableIcon : true,
            disableInputs : true,
            isAdditionalCoordinators : false,
            coordinatorUserInputsObj : {'firstName' : '', 'lastName' : '', 'phone' : '', 'coordinatorId' : '', 'parentId' : '', 'fullName' : '', isAllow : false, 'isCoordinatorFirstNameBlank' : false},
            showNoContactRecordsErrorMessage :false,
            disableAddContactIcon : true,
            noInputsError : false
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
    @track refreshKey = Date.now();

    donorCodeOptions = [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
    ];

    /***********************custom lookup handle****************************** */
    async handleValueSelectedOnAccount(event){
        console.log(JSON.stringify(event.detail));
        let clinicNumber = event.target.dataset.clinicnumber;
        let result = await fetchSpermBankRecord({accountId : event.detail.id});
        if(result){
            try{
                console.log(JSON.stringify(result));
                this.spermBanks = this.spermBanks.map(bank => {
                    console.log(bank.clinicNumber+'____'+clinicNumber)
                    if (bank.clinicNumber == clinicNumber){
                        return { 
                            ...bank, 
                            name: result.Name || bank.name,
                            website :  result.Website || bank.website,
                            phone : result.Phone || bank.phone,
                            accountId : result.Id || bank.accountId,
                            disableInputs : true
                        };
                    }
                    return bank;
                });
                this.spermBanks = [...  this.spermBanks];
                console.log(JSON.stringify(this.spermBanks));
            }
            catch(e){
                console.log(e.stack);
                console.log(e.message);
            }
        }
    }

    handleLookupData(event) {
        let clinicNumber = event.target.dataset.clinicnumber;
        this.spermBanks = this.spermBanks.map(bank => {
            if (bank.clinicNumber == clinicNumber) {
                if(event.detail == true){
                    return { 
                        ...bank, 
                        showNoAccountRecordsErrorMessage: false,
                        disableIcon : true  
                    };
                }
                else{
                    return { 
                        ...bank, 
                        showNoAccountRecordsErrorMessage: true,
                        disableIcon : false 
                    };
                }
                
            }
            return bank;
        });
        console.log(JSON.stringify(this.spermBanks));
    }

    handleCancelLookup(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.spermBanks = this.spermBanks.map(bank => {
            if (bank.clinicNumber == clinicNumber) {
                return { 
                    ...bank, 
                    name: '',
                    website: '',
                    phone: '',
                    email: '',
                    accountId : ''
                };
            }
        })
    }

    handleAddSpermBankDetails(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.spermBanks = this.spermBanks.map(bank => {
            if (bank.clinicNumber == clinicNumber) {
                return { 
                    ...bank,
                    oldJunctionId : bank.junctionId, 
                    name: '',
                    website: '',
                    phone: '',
                    email: '',
                    accountId : '',
                    disableInputs :  false  
                };
            }
            return bank;
        });
         this.spermBanks = [...  this.spermBanks];
        console.log(JSON.stringify(this.spermBanks));
    }

    /**************** coordinator starts ******************** */
    handleValueSelectedOnContact(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.spermBanks = this.spermBanks.map(bank => {
            if (bank.clinicNumber == clinicNumber) {
                return { ... bank,
                        isAdditionalCoordinators : false,
                        coordinatorUserInputsObj : {
                                ...bank.coordinatorUserInputsObj, 
                                coordinatorId : event.detail.id,
                                fullName : event.detail.mainField,
                                isAllow : true
                            }
                        }
            }
            return bank;
        }); 
        console.log('>>> spermbanks >>> ' + JSON.stringify(this.spermBanks))

    }

    handleContactLookupData(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.spermBanks = this.spermBanks.map(bank => {
            if (bank.clinicNumber == clinicNumber) {
                if(event.detail == true){
                    return { 
                        ...bank, 
                        showNoContactRecordsErrorMessage: false,
                        disableAddContactIcon : true  
                    };
                }
                else{
                    return { 
                        ...bank, 
                        showNoContactRecordsErrorMessage: true,
                        disableAddContactIcon : false 
                    };
                }
                
            }
            return bank;
        });
        console.log(JSON.stringify(this.spermBanks));
    }

    
    handleAddCoordinator(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.spermBanks = this.spermBanks.map(bank => {
            if (bank.clinicNumber == clinicNumber) {
                return { ... bank, isAdditionalCoordinators : !bank.isAdditionalCoordinators}
            }
            return bank;
        });  

        /*let clinicNumber = event.target.dataset.clinicnumber;
        this.spermBanks = this.spermBanks.map(bank => {
            if (bank.clinicNumber == clinicNumber) {
                return { 
                    ...bank, 
                    disableInputs :  false  
                };
            }
            return bank;
        });*/
        console.log(JSON.stringify(this.spermBanks));
    }
    handleCoordinatorInputs(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.spermBanks = this.spermBanks.map(bank => {
            if (bank.clinicNumber == clinicNumber) {
                return {
                    ...bank,
                    coordinatorUserInputsObj: {
                        ...bank.coordinatorUserInputsObj,
                        [event.target.name]: event.target.value,
                        parentId: bank.accountId,
                        isAllow : false,
                        isCoordinatorFirstNameBlank : false
                    }
                };
            }
            return bank;
        });
        console.log(JSON.stringify(this.spermBanks));
    }

    async handleCoordinatorSave(event){
        try{
            let clinicNumber = event.target.dataset.clinicnumber;
            let coordinatorUserInputs = {};
            this.spermBanks.forEach(bank => {
                if (bank.clinicNumber == clinicNumber) {
                    coordinatorUserInputs = {... bank.coordinatorUserInputsObj};
                }
            });

            if(coordinatorUserInputs.firstName != null && coordinatorUserInputs.firstName.trim() != ''){
                this.loadSpinner = true;
                console.log('  >>> '+JSON.stringify(coordinatorUserInputs))  
                let result = await createCoordinator({coordinateData : JSON.stringify(coordinatorUserInputs)})
                if (result.isSuccess) {
                    let response = JSON.parse(result.message)

                    this.spermBanks = this.spermBanks.map(bank => {
                        if (bank.clinicNumber == clinicNumber) {
                            return {
                                ...bank,
                                coordinator: response.coordinatorId,
                                isAdditionalCoordinators : false,
                                coordinatorUserInputsObj : {... response, isAllow : true},
                                showAddIcon : false
                            };
                        }
                        return bank;
                    });
                    this.spermBanks = [... this.spermBanks];
                    console.log(' spermBanks >>> '+JSON.stringify(this.spermBanks))  

                }
                setTimeout(() => {
                    this.loadSpinner = false;
                }, 3000)
            }
            else{
                this.spermBanks = this.spermBanks.map(bank => {
                    if (bank.clinicNumber == clinicNumber) {
                       return {
                            ... bank,
                            coordinatorUserInputsObj : {
                               ...bank.coordinatorUserInputsObj,
                                isCoordinatorFirstNameBlank : true
                            }
                       }
                    }
                    return bank
                });
            }
           
        }
        catch(e){
            console.log(e.stack);
            console.log(e.message);
            setTimeout(() => {
                this.loadSpinner = false;
            }, 3000)
        }

    }

    /*************************************************************** */

    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        if(this.contactObj &&  this.contactObj['spermBanks'] && this.contactObj['spermBanks'].length > 0){
            this.spermBanks = this.contactObj['spermBanks'].map((bank, index) => {
                return {
                    ...bank,
                    clinicNumber: index + 1,
                    knowDonorCode : bank.knowDonorCode,
                    noInputsError : false,
                    disableInputs : true
                };
            });
            //alert()
            this.noSpermBankChecked = this.spermBanks[0]['noSpermBankCheckedDisableInputs']
            if(this.noSpermBankChecked){
                this.spermBanks = this.spermBanks.map(bank => {
                    return {
                        ... bank,
                        coordinatorUserInputsObj : {
                            ...bank.coordinatorUserInputsObj,
                            'firstName' : '',
                            'lastName' : '', 
                            'phone' : '', 
                            'coordinatorId' : '', 
                            'parentId' : '', 
                            'fullName' : ''
                        }
                    }
                })
            }
            //alert(this.spermBanks[0].coordinatorUserInputsObj.coordinatorId);
            console.log( 'callback >>> ' + JSON.stringify(this.spermBanks));
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
        let clinicNumber = event.target.dataset.clinicnumber;
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

        this.spermBanks = this.spermBanks.map(bank => {
            if(bank.clinicNumber == clinicNumber) {
                return {
                    ...bank, 
                    noInputsError : false
                }
            }
            return bank;
        })
        
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
        this.loadSpinner = true;
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
            oldJunctionId : '',
            accountId : '',
            junctionId : '',
            showDonorCodeInput: false,
            showNoAccountRecordsErrorMessage :false,
            disableIcon : true,
            disableInputs : true,
            isAdditionalCoordinators : false,
            coordinatorUserInputsObj : {'firstName' : '', 'lastName' : '', 'phone' : '', 'coordinatorId' : '', 'parentId' : '', 'fullName' : '', isAllow : false, 'isCoordinatorFirstNameBlank' : false},
            showNoContactRecordsErrorMessage :false,
            disableAddContactIcon : true,
            noInputsError : false
        });
        /*this.spermBanks = this.spermBanks.map((bank, i) => ({
            ...bank,
            clinicNumber: i + 1,
            clinicHeading: ''
        }));*/
        this.spermBanks = [... this.spermBanks];
        console.log(JSON.stringify(this.spermBanks))
        setTimeout(() => {
            this.loadSpinner = false;
        }, 3000);
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
            this.template.querySelectorAll('lightning-input').forEach((input, index) => {
                const fieldName = input.name;
                const value = input.value;
                const fieldsMap = new Map([
                    ['name', 'Please enter sperm bank name'],
                    ['donorCode', 'Please enter donor code']
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
                this.spermBanks = [... this.spermBanks];
                console.log('contact');
                console.log(JSON.stringify(this.contactObj));
                console.log(' >>> spermBanks >>>' + JSON.stringify(this.spermBanks))
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
            }
            else{
                 console.log(' else>>> spermBanks >>>' + JSON.stringify(this.spermBanks))
                this.spermBanks = this.spermBanks.map(bank => {
                    let nameIsEmpty = !bank.name || bank.name.trim() === '';
                    if(nameIsEmpty && bank.disableInputs == true){
                        return {
                            ...bank, 
                            noInputsError : true
                        }
                    }
                    else{
                        return {
                            ...bank, 
                            noInputsError : false
                        }
                    }
                })
            }
            

        }
        catch(e){
            console.log('error >>')
            console.log(e.message)
            console.log(e.stack)
        }
    }

    handleSpermBankInfoBack() {
        try{
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
            this.contactObj['spermBanks'] = this.spermBanks
            this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
        }
        catch(e){
            console.log('error >>')
            console.log(e.message)
            console.log(e.stack)
        }
    }
}