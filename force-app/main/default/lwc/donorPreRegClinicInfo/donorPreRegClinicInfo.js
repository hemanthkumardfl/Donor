import { LightningElement, track, api } from 'lwc';
import deleteSpermBank from '@salesforce/apex/SpermDonorPreRegistrationController.deleteSpermBank';

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
            junctionId : ''
        }
    ];
    //@track showNumberedHeadings = false;
    @track noClinicChecked = false;
    @track showDeletePopup = false;
    @track deleteIndex = null;
    @track deleteClinicNumber = null;
    @api clinicUserInputWithoutSDN;
    @api contactObj;

     connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
       if(this.contactObj &&  this.contactObj['clinics'] && this.contactObj['clinics'].length > 0){
            this.clinics = this.contactObj['clinics'].map((clinic, index) => {
                return {
                    ...clinic,
                    clinicNumber: index + 1
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
            coordinator: ''
        });
        this.clinics = this.clinics.map((clinic, i) => ({
            ...clinic,
            clinicNumber: i + 1,
            clinicHeading: ''
        }));
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
            let resultData = await deleteSpermBank({ spermbankId: this.clinics[index].accountId }); 
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
    }

    handleClinicInfoBack() {
        this.contactObj['clinics'] = this.clinics
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }
}