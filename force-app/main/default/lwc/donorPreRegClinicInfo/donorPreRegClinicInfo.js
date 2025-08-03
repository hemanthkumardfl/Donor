import { LightningElement, track, api } from 'lwc';
import deleteSpermClinic from '@salesforce/apex/SpermDonorPreRegistrationController.deleteSpermClinic';
import fetchSpermBankRecord from '@salesforce/apex/UtilityClass.fetchSpermBankRecord';
import createCoordinator from '@salesforce/apex/UtilityClass.createCoordinator';

export default class DonorPreRegClinicInfo extends LightningElement {
    @track clinics = [
        {
            id: Date.now(),
            clinicNumber: 1,
            clinicHeading: '',
            name: '',
            doctorName: '',
            website: '',
            phone: '',
            email: '',
            cityState: '',
            coordinator: '',
             accountId : '',
            junctionId : '',
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
    //@track showNumberedHeadings = false;
    @track noClinicChecked = false;
    @track showDeletePopup = false;
    @track deleteIndex = null;
    @track deleteClinicNumber = null;
    @api clinicUserInputWithoutSDN;
    @api contactObj;
    @track loadSpinner = false


    /********************************custom lookups starts here********************************************** */
    handleLookupData(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.clinics = this.clinics.map(clinic => {
            if (clinic.clinicNumber == clinicNumber) {
                if(event.detail == true){
                    return { 
                        ...clinic, 
                        showNoAccountRecordsErrorMessage: false,
                        disableIcon : true  
                    };
                }
                else{
                    return { 
                        ...clinic, 
                        showNoAccountRecordsErrorMessage: true,
                        disableIcon : false 
                    };
                }
                
            }
            return clinic;
        });
        console.log(JSON.stringify(this.clinics));
    }

    async handleValueSelectedOnAccount(event){
        console.log(JSON.stringify(event.detail));
        let clinicNumber = event.target.dataset.clinicnumber;
        let result = await fetchSpermBankRecord({accountId : event.detail.id});
        if(result){
            try{
                console.log(JSON.stringify(result));
                this.clinics = this.clinics.map(clinic => {
                    console.log(clinic.clinicNumber+'____'+clinicNumber)
                    if (clinic.clinicNumber == clinicNumber){
                        return { 
                            ...clinic, 
                            name: result.Name || clinic.name,
                            website :  result.Website || clinic.website,
                            phone : result.Phone || clinic.phone,
                            accountId : result.Id || clinic.accountId,
                            disableInputs : true
                        };
                    }
                    return clinic;
                });
                this.clinics = [...  this.clinics];
                console.log(JSON.stringify(this.clinics));
            }
            catch(e){
                console.log(e.stack);
                console.log(e.message);
            }
        }
    }

    handleAddSpermBankDetails(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.clinics = this.clinics.map(clinic => {
            if (clinic.clinicNumber == clinicNumber) {
                return { 
                    ...clinic, 
                    disableInputs :  false  
                };
            }
            return clinic;
        });
         this.clinics = [...  this.clinics];
        console.log(JSON.stringify(this.clinics));
    }


    /****************************************************************************************************** */
    /*****************************************Coordinator lookup starts here******************************* */

    handleValueSelectedOnContact(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.clinics = this.clinics.map(clinic => {
            if (clinic.clinicNumber == clinicNumber) {
                return { ... clinic,
                        isAdditionalCoordinators : false,
                        coordinatorUserInputsObj : {
                                ...clinic.coordinatorUserInputsObj, 
                                coordinatorId : event.detail.id,
                                fullName : event.detail.mainField,
                                isAllow : true
                            }
                        }
            }
            return clinic;
        }); 
        console.log('>>> clinics >>> ' + JSON.stringify(this.clinics))

    }

    handleContactLookupData(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.clinics = this.clinics.map(clinic => {
            if (clinic.clinicNumber == clinicNumber) {
                if(event.detail == true){
                    return { 
                        ...clinic, 
                        showNoContactRecordsErrorMessage: false,
                        disableAddContactIcon : true  
                    };
                }
                else{
                    return { 
                        ...clinic, 
                        showNoContactRecordsErrorMessage: true,
                        disableAddContactIcon : false 
                    };
                }
                
            }
            return clinic;
        });
        console.log(JSON.stringify(this.clinics));
    }

    handleAddCoordinator(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.clinics = this.clinics.map(clinic => {
            if (clinic.clinicNumber == clinicNumber) {
                return { ... clinic, isAdditionalCoordinators : !clinic.isAdditionalCoordinators}
            }
            return clinic;
        });  
        console.log(JSON.stringify(this.clinics));
    }

    handleCoordinatorInputs(event){
        let clinicNumber = event.target.dataset.clinicnumber;
        this.clinics = this.clinics.map(clinic => {
            if (clinic.clinicNumber == clinicNumber) {
                return {
                    ...clinic,
                    coordinatorUserInputsObj: {
                        ...clinic.coordinatorUserInputsObj,
                        [event.target.name]: event.target.value,
                        parentId: clinic.accountId,
                        isAllow : false,
                        isCoordinatorFirstNameBlank : false
                    }
                };
            }
            return clinic;
        });
        console.log(JSON.stringify(this.clinics));
    }

    async handleCoordinatorSave(event){
        try{
            let clinicNumber = event.target.dataset.clinicnumber;
            let coordinatorUserInputs = {};
            this.clinics.forEach(clinic => {
                if (clinic.clinicNumber == clinicNumber) {
                    coordinatorUserInputs = {... clinic.coordinatorUserInputsObj};
                }
            });
            if(coordinatorUserInputs.firstName != null && coordinatorUserInputs.firstName.trim() != ''){
                this.loadSpinner = true;
                console.log('  >>> '+JSON.stringify(coordinatorUserInputs))  
                let result = await createCoordinator({coordinateData : JSON.stringify(coordinatorUserInputs)})
                if (result.isSuccess) {
                    let response = JSON.parse(result.message)

                    this.clinics = this.clinics.map(clinic => {
                        if (clinic.clinicNumber == clinicNumber) {
                            return {
                                ...clinic,
                                coordinator: response.coordinatorId,
                                isAdditionalCoordinators : false,
                                coordinatorUserInputsObj : {... response, isAllow : true},
                                showAddIcon : false
                            };
                        }
                        return clinic;
                    });

                    this.clinics = [... this.clinics];
            

                    console.log(' clinics >>> '+JSON.stringify(this.clinics))  

                }
                setTimeout(() => {
                    this.loadSpinner = false
                }, 3000)
            }
            else{
                this.clinics = this.clinics.map(clinic => {
                    if (clinic.clinicNumber == clinicNumber) {
                       return {
                            ... clinic,
                            coordinatorUserInputsObj : {
                               ...clinic.coordinatorUserInputsObj,
                                isCoordinatorFirstNameBlank : true
                            }
                       }
                    }
                    return clinic
                });
            }
        }
        catch(e){
            console.log(e.stack);
            console.log(e.message);
            setTimeout(() => {
                this.loadSpinner = false
            }, 3000)
        }

    }

    /******************************************************************************************************** */

     connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
       if(this.contactObj &&  this.contactObj['clinics'] && this.contactObj['clinics'].length > 0){
            this.clinics = this.contactObj['clinics'].map((clinic, index) => {
                return {
                    ...clinic,
                    clinicNumber: index + 1,
                    noInputsError : false,
                    disableInputs : true
                };
            });
            this.noClinicChecked = this.clinics[0]['noClinicCheckedDisableInputs'];
            //alert()
            console.log(JSON.stringify(this.clinics));
        }
    }

    get disableAddAnotherClinic() {
        let clsName = 'textcls addagencycls inputscls';
        if (this.noClinicChecked) {
            clsName += ' disableAddAnotherClickCls';
        }
        return clsName;
    }

    get checkboxStatus() {
        return this.clinics.length > 1;
        //return true;
    }

    handleNoClinicChange(event) {
        this.noClinicChecked = event.target.checked;
        if (this.noClinicChecked) {
            this.clinics[0] = {
                ...this.clinics[0],
                name: '',
                doctorName: '',
                website: '',
                phone: '',
                email: '',
                cityState: '',
                coordinator: ''
            };
        }
        this.clinics = [...this.clinics];
    }

    handleInputChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.name;
        this.clinics = this.clinics.map(clinic => 
            clinic.id === this.clinics[index].id
                ? { ...clinic, [field]: event.target.value }
                : clinic
        );
        const input = event.target;
        if (input.validity.valid) {
            input.setCustomValidity('');
            input.reportValidity();
        }
    }

    get  showNumberedHeadings(){
        let result = false;
        if(this.clinics.length > 1){
            result = true;
        }
        return result;
    }


    handleInputBlur(event) {
        const input = event.target;
        const fieldName = input.name;
        const value = input.value;
        const fieldsMap = new Map([
            ['name', 'Please enter clinic name']
            // ['doctorName', 'Please enter doctor\'s name'],
            // ['website', 'Please enter website'],
            // ['cityState', 'Please enter city/state of clinic'],
            // ['phone', 'Please enter phone number'],
            // ['email', 'Please enter email'],
            // ['coordinator', 'Please enter coordinator/nurse name']
        ]);

        if (fieldsMap.has(fieldName)) {
            if (value === '' && !this.noClinicChecked) {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        }
    }

    handleAddAnotherClick() {
        //this.showNumberedHeadings = true;
        this.loadSpinner = true;
        this.noClinicChecked = false;
        this.clinics.push({
            id: Date.now(),
            clinicNumber: this.clinics.length + 1,
            clinicHeading: '',
            name: '',
            doctorName: '',
            website: '',
            phone: '',
            email: '',
            cityState: '',
            coordinator: '',
            accountId : '',
            junctionId : '',
            showNoAccountRecordsErrorMessage :false,
            disableIcon : true,
            disableInputs : true,
            isAdditionalCoordinators : false,
            coordinatorUserInputsObj : {'firstName' : '', 'lastName' : '', 'phone' : '', 'coordinatorId' : '', 'parentId' : '', 'fullName' : '', isAllow : false, 'isCoordinatorFirstNameBlank' : false},
            showNoContactRecordsErrorMessage :false,
            disableAddContactIcon : true,
            noInputsError : false
        });
        this.clinics = this.clinics.map((clinic, i) => ({
            ...clinic,
            clinicNumber: i + 1,
            clinicHeading: ''
        }));
        setTimeout(()=>{
            this.loadSpinner = false;
        }, 3000)
    }

    handleDeleteConfirm(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const clinic = this.clinics.find(clinic => clinic.id === this.clinics[index].id);
        this.deleteIndex = index;
        this.deleteClinicNumber = clinic ? clinic.clinicNumber : null;
        this.showDeletePopup = true;
    }

    async handleDeleteYes() {
        const index = this.deleteIndex;
         if(this.clinics[index].accountId){
            let resultData = await deleteSpermClinic({ spermbankId: this.clinics[index].accountId }); 
            //alert('Delete Clinic >>> ' + JSON.stringify(resultData));
            
        }

        this.clinics = this.clinics.filter((_, i) => i !== index);
        this.clinics = this.clinics.map((clinic, i) => ({
            ...clinic,
            clinicNumber: i + 1,
            clinicHeading: this.clinics.length === 1 ? 'Fertility Clinic Details' : ''
        }));
        //this.showNumberedHeadings = this.clinics.length > 1;
        if (this.clinics.length === 1) {
            this.noClinicChecked = false;
        }
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteClinicNumber = null;
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteClinicNumber = null;
    }

    handleClinicInfoNext() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        if (this.noClinicChecked) {
            this.clinics[0]['noClinicChecked'] = true;
            this.contactObj['clinics'] = this.clinics;
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }

        let isValid = true;
        this.template.querySelectorAll('lightning-input').forEach(input => {
            const fieldName = input.name;
            const value = input.value;
            const fieldsMap = new Map([
                ['name', 'Please enter clinic name']
                // ['doctorName', 'Please enter doctor\'s name'],
                // ['website', 'Please enter website'],
                // ['cityState', 'Please enter city/state of clinic'],
                // ['phone', 'Please enter phone number'],
                // ['email', 'Please enter email'],
                // ['coordinator', 'Please enter coordinator/nurse name']
            ]);

            if (fieldsMap.has(fieldName)) {
                if (value === '' && !this.noClinicChecked) {
                    input.setCustomValidity(fieldsMap.get(fieldName));
                    input.reportValidity();
                    isValid = false;
                } else {
                    input.setCustomValidity('');
                    input.reportValidity();
                }
            }
        });

        if (isValid) {
            this.clinics[0]['noClinicChecked'] = false;
            this.clinics[0]['noClinicCheckedDisableInputs'] = this.noClinicChecked;
            this.contactObj['clinics'] = this.clinics
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }
        else{
            console.log(' else>>> clinics >>>' + JSON.stringify(this.clinics))
            this.clinics = this.clinics.map(clinic => {
                let nameIsEmpty = !clinic.name || clinic.name.trim() === '';
                if(nameIsEmpty && clinic.disableInputs == true){
                    return {
                        ...clinic, 
                        noInputsError : true
                    }
                }
                else{
                    return {
                        ...clinic, 
                        noInputsError : false
                    }
                }
            })
        }
    }

    handleClinicInfoBack() {
        this.contactObj['clinics'] = this.clinics
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }
}