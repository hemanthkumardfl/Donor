import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import spermDonor from '@salesforce/apex/DonorPreRegHippaController2222.spermDonor';
import updateDonorName from '@salesforce/apex/DonorPreRegHippaController2222.updateDonorName';
import deleteSpermBank from '@salesforce/apex/DonorPreRegHippaController2222.deleteSpermBank';
import addSpermBank from '@salesforce/apex/DonorPreRegHippaController2222.addSpermBank';
import editSpermBank from '@salesforce/apex/DonorPreRegHippaController2222.editSpermBank';
import deleteAgency from '@salesforce/apex/DonorPreRegHippaController2222.deleteAgency';
import addAgency from '@salesforce/apex/DonorPreRegHippaController2222.addAgency';
import editAgency from '@salesforce/apex/DonorPreRegHippaController2222.editAgency';
import deleteClinic from '@salesforce/apex/DonorPreRegHippaController2222.deleteClinic';
import addClinic from '@salesforce/apex/DonorPreRegHippaController2222.addClinic';
import editClinic from '@salesforce/apex/DonorPreRegHippaController2222.editClinic';
import deleteAttorney from '@salesforce/apex/DonorPreRegHippaController2222.deleteAttorney';
import addAttorney from '@salesforce/apex/DonorPreRegHippaController2222.addAttorney';
import editAttorney from '@salesforce/apex/DonorPreRegHippaController2222.editAttorney';
import deleteRecipient from '@salesforce/apex/DonorPreRegHippaController2222.deleteRecipient';
import addRecipient from '@salesforce/apex/DonorPreRegHippaController2222.addRecipient';
import editRecipient from '@salesforce/apex/DonorPreRegHippaController2222.editRecipient';

export default class DonorPreRegHippa extends LightningElement {
    @api contactObj;
    @track legalName = { firstName: '', lastName: '' };
    @track legalNamesri = { firstName: '', lastName: '' };
    @track dob = '';
    @track address = { state: '', city: '', street: '', pincode: '', additionalInfo: '' };
    @track dobError = '';
    @track isYesChecked = true;
    @track isNoChecked = false;
    @track isDisabled = true;
    @track nameConfirmation = 'Yes';
    @track agencies = [];
    @track sperms = [];
    @track clinics = [];
    @track attorneys = [];
    @track recipients = [];
    @track showagencySection = false;
    @track showSpermBankSection = false;
    @track showclinicSection = false;
    @track showattorneySection = false;
    @track showrecipientSection = false;
    @track showAgencyForm = false;
    @track showSpermForm = false;
    @track showClinicForm = false;
    @track showAttorneyForm = false;
    @track showRecipientForm = false;
    @track newAgency = { id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '' };
    @track newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '' };
    @track newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '' };
    @track newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '' };
    @track newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '' };
    @track isConfirmed = false;
    @track showDeletePopup = false;
    @track deleteItemType = '';
    @track deleteItemIndex = -1;
    @track deleteItemName = '';
    @track deleteItemId = '';
    @track noAgencyChecked = false;
    @track noSpermChecked = false;
    @track noClinicChecked = false;
    @track noAttorneyChecked = false;
    @track noRecipientChecked = false;
    @track isEditingAgency = false;
    @track isEditingSperm = false;
    @track isEditingClinic = false;
    @track isEditingAttorney = false;
    @track isEditingRecipient = false;

    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        this.donorId = this.contactObj.donorId;
        if (this.contactObj.donorType === 'egg') {
            this.showagencySection = true;
            this.showclinicSection = true;
            this.showSpermBankSection = false;
            this.showattorneySection = true;
            this.showrecipientSection = true;
        } else if (this.contactObj.donorType === 'sperm') {
            this.showagencySection = false;
            this.showSpermBankSection = true;
            this.showclinicSection = true;
            this.showattorneySection = false;
            this.showrecipientSection = true;
        }

        this.legalNamesri.firstName = this.contactObj.firstName || '';
        this.legalNamesri.lastName = this.contactObj.lastName || '';
        this.dob = this.contactObj.dob || '';
        this.address.state = this.contactObj.state || '';
        this.address.city = this.contactObj.city || '';
        this.address.street = this.contactObj.street || '';
        this.address.pincode = this.contactObj.pincode || '';
        this.address.additionalInfo = this.contactObj.additionalInfo || '';

        spermDonor({ donorId: this.contactObj.donorId })
            .then(result => {
                 console.log('Result2222 >>> '+JSON.stringify(result));
    if (result.parentdetails) {
        this.legalNamesri.firstName = result.parentdetails.fristName || '';
        this.legalNamesri.lastName = result.parentdetails.lastName || '';
        this.dob = result.parentdetails.dob || '';
        this.address.state = result.parentdetails.state || '';
        this.address.city = result.parentdetails.city || '';
        this.address.street = result.parentdetails.street || '';
        this.address.pincode = result.parentdetails.pincode || '';
        this.address.additionalInfo = result.parentdetails.additionalInfo || '';
    }
    if (result.Agencylist) {
        this.agencies = result.Agencylist.map(item => ({
            id: item.Id,
            agencyName: item.Name,
            phone: item.Phone || '',
            coordinatorName: item.coordinatorName || '',
            website: item.website || '',
            cityState: '',
            coordinatorEmail: item.email || ''
        }));
        
            this.sperms = result.Agencylist.map(item => ({
                id: item.Id,
                spermBankName: item.Name,
                spermBankPhone: item.Phone || '',
                coordinatorName: item.coordinatorName || '',
                spermBankWebsite: item.website || '',
                spermBankEmail: item.email || '',
                isFromPrimaryBanks: false
            }));
        
    }
    if (result.Cliniclist) {
        this.clinics = result.Cliniclist.map(item => ({
            id: item.Id,
            clinicName: item.Name,
            phone: item.Phone || '',
            coordinatorName: item.coordinatorName || '',
            website: item.website || '',
            cityState: item.cityState || '',
            coordinatorEmail: item.email || ''
        }));
    }
    if (result.Attorneylist) {
        this.attorneys = result.Attorneylist.map(item => ({
            id: item.Id,
            attorneyName: item.Name,
            phone: item.Phone || '',
            lawFirm: item.lawFirm || '',
            website: item.website || '',
            cityState: item.cityState || '',
            email: item.email || ''
        }));
    }
   if (result.Recipientlist) {
        this.recipients = result.Recipientlist.map(item => ({
                id: item.Id,
                firstName: item.firstName,
                lastName: item.lastName,
                Name: (item.fristName ||'')+''+(item.lastName || ''),
                //recipientName: (item.firstName||'') +''+ (item.lastName || ''),
                phone: item.Phone || '',
                email: item.email || '',
                additionalInfo: item.additionalInfo || ''
    
        }));
    }
})
.catch(error => {
    this.showToast('Error', 'Failed to load donor data: ' + error.body.message, 'error');
});
    }

    get addAgencyClass() {
        return this.noAgencyChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    }

    get addSpermClass() {
        return this.noSpermChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    }

    get addClinicClass() {
        return this.noClinicChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    }

    get addAttorneyClass() {
        return this.noAttorneyChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    }

    get addRecipientClass() {
        return this.noRecipientChecked ? 'slds-button slds-button_neutral disabled' : 'slds-button slds-button_neutral';
    }

    get agencyButtonLabel() {
        return this.isEditingAgency ? 'Save' : 'Add';
    }

    get spermButtonLabel() {
        return this.isEditingSperm ? 'Save' : 'Add';
    }

    get clinicButtonLabel() {
        return this.isEditingClinic ? 'Save' : 'Add';
    }

    get attorneyButtonLabel() {
        return this.isEditingAttorney ? 'Save' : 'Add';
    }

    get recipientButtonLabel() {
        return this.isEditingRecipient ? 'Save' : 'Add';
    }

    handleSpermBankChange(event) {
        this.nameConfirmation = event.target.value;
        this.isYesChecked = this.nameConfirmation === 'Yes';
        this.isNoChecked = this.nameConfirmation === 'No';
        this.isDisabled = this.isYesChecked;
        if (this.isYesChecked) {
            this.legalName = { firstName: this.legalNamesri.firstName, lastName: this.legalNamesri.lastName };
        }
    }

    handleLegalNameChange(event) {
        const field = event.target.name;
        this.legalName = { ...this.legalName, [field]: event.target.value };
        updateDonorName({
            donorId: this.donorId,
            firstName: this.legalName.firstName,
            lastName: this.legalName.lastName,
            dob: this.dob,
            state: this.address.state, // Added
        city: this.address.city, // Added
        street: this.address.street, // Added
        pincode: this.address.pincode, // Added
        additionalInfo: this.address.additionalInfo
        })
            .then(() => {
                this.legalNamesri = { ...this.legalName };
                this.showToast('Success', 'Donor name updated successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'Error updating donor name: ' + error.body.message, 'error');
            });
    }

handleAddressChange(event) {
    const field = event.target.dataset.field;
    this.address = { ...this.address, [field]: event.target.value };
}

    handleDobChange(event) {
        const dobValue = event.target.value;
        const today = new Date();
        const inputDate = new Date(dobValue);
        const ageDiff = today.getFullYear() - inputDate.getFullYear();
        const monthDiff = today.getMonth() - inputDate.getMonth();
        const dayDiff = today.getDate() - inputDate.getDate();
        const isAdult = ageDiff > 18 || (ageDiff === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

        if (inputDate > today) {
            this.dobError = 'Date of Birth cannot be in the future.';
            this.dob = '';
        } else if (!isAdult) {
            this.dobError = 'Donor must be at least 18 years old.';
            this.dob = '';
        } else {
            this.dobError = '';
            this.dob = dobValue;
            updateDonorName({
                donorId: this.donorId,
                firstName: this.legalNamesri.firstName,
                lastName: this.legalNamesri.lastName,
                dob: this.dob,
                state: this.address.state, // Added
            city: this.address.city, // Added
            street: this.address.street, // Added
            pincode: this.address.pincode, // Added
            additionalInfo: this.address.additionalInfo
            })
                .then(() => {
                    this.showToast('Success', 'Date of Birth updated successfully', 'success');
                })
                .catch(error => {
                    this.showToast('Error', 'Error updating Date of Birth: ' + error.body.message, 'error');
                });
        }
    }

    handleNoAgencyChange(event) {
        this.noAgencyChecked = event.target.checked;
        if (this.noAgencyChecked) {
            this.agencies = [];
            this.newAgency = { id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '' };
            this.showagencySection = false;
        } else {
            this.showagencySection = true;
        }
    }

    handleNoSpermChange(event) {
        this.noSpermChecked = event.target.checked;
        if (this.noSpermChecked) {
            this.sperms = [];
            this.newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '' };
            this.showSpermBankSection = false;
        } else {
            this.showSpermBankSection = true;
        }
    }

    handleNoClinicChange(event) {
        this.noClinicChecked = event.target.checked;
        if (this.noClinicChecked) {
            this.clinics = [];
            this.newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '' };
            this.showclinicSection = false;
        } else {
            this.showclinicSection = true;
        }
    }

    handleNoAttorneyChange(event) {
        this.noAttorneyChecked = event.target.checked;
        if (this.noAttorneyChecked) {
            this.attorneys = [];
            this.newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '' };
            this.showattorneySection = false;
        } else {
            this.showattorneySection = true;
        }
    }

    handleNoRecipientChange(event) {
        this.noRecipientChecked = event.target.checked;
        if (this.noRecipientChecked) {
            this.recipients = [];
            this.newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '' };
            this.showrecipientSection = false;
        } else {
            this.showrecipientSection = true;
        }
    }

    handleAddAgencyClick() {
        this.showAgencyForm = true;
        this.isEditingAgency = false;
        this.newAgency = { id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '' };
    }

    handleEditAgency(event) {
        const index = event.target.dataset.index;
        this.isEditingAgency = true;
        this.newAgency = { ...this.agencies[index] };
        this.showAgencyForm = true;
    }

    handleDeleteAgency(event) {
        const index = event.target.dataset.index;
        this.showDeletePopup = true;
        this.deleteItemType = 'Agency';
        this.deleteItemIndex = index;
        this.deleteItemName = this.agencies[index].agencyName;
        this.deleteItemId = this.agencies[index].id;
    }

    handleAgencyFieldChange(event) {
        const field = event.target.dataset.field;
        this.newAgency = { ...this.newAgency, [field]: event.target.value };
    }

    handleCancelAgency() {
        this.showAgencyForm = false;
        this.newAgency = { id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '' };
        this.isEditingAgency = false;
    }

    handleSaveAgency() {
        if (!this.newAgency.agencyName) {
            this.showToast('Error', 'Agency Name is required', 'error');
            return;
        }

        if (this.isEditingAgency) {
            editAgency({
                accountId: this.newAgency.id,
                agencyName: this.newAgency.agencyName,
                phone: this.newAgency.phone,
                coordinatorName: this.newAgency.coordinatorName,
                website: this.newAgency.website,
                cityState: this.newAgency.cityState,
                email: this.newAgency.coordinatorEmail
            })
                .then(() => {
                    const updatedAgencies = [...this.agencies];
                    updatedAgencies[this.agencies.findIndex(a => a.id === this.newAgency.id)] = { ...this.newAgency };
                    this.agencies = updatedAgencies;
                    this.showToast('Success', 'Agency updated successfully', 'success');
                    this.handleCancelAgency();
                })
                .catch(error => {
                    this.showToast('Error', 'Error updating agency: ' + error.body.message, 'error');
                });
        } else {
            addAgency({
                donorId: this.donorId,
                agencyName: this.newAgency.agencyName,
                phone: this.newAgency.phone,
                coordinatorName: this.newAgency.coordinatorName,
                website: this.newAgency.website,
                cityState: this.newAgency.cityState,
                email: this.newAgency.coordinatorEmail
            })
                .then(result => {
                    this.agencies = [...this.agencies, { ...this.newAgency, id: result }];
                    this.showToast('Success', 'Agency added successfully', 'success');
                    this.handleCancelAgency();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding agency: ' + error.body.message, 'error');
                });
        }
    }

    handleAddSpermClick() {
        this.showSpermForm = true;
        this.isEditingSperm = false;
        this.newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '' };
    }

    handleEditSperm(event) {
        const index = event.target.dataset.index;
        this.isEditingSperm = true;
        this.newSperm = { ...this.sperms[index] };
        this.showSpermForm = true;
    }

    handleDeleteSperm(event) {
        const index = event.target.dataset.index;
        this.showDeletePopup = true;
        this.deleteItemType = 'Sperm';
        this.deleteItemIndex = index;
        this.deleteItemName = this.sperms[index].spermBankName;
        this.deleteItemId = this.sperms[index].id;
    }

    handleSpermFieldChange(event) {
        const field = event.target.dataset.field;
        this.newSperm = { ...this.newSperm, [field]: event.target.value };
    }

    handleCancelSperm() {
        this.showSpermForm = false;
        this.newSperm = { id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '' };
        this.isEditingSperm = false;
    }

    handleSaveSperm() {
        if (!this.newSperm.spermBankName) {
            this.showToast('Error', 'Sperm Bank Name is required', 'error');
            return;
        }

        if (this.isEditingSperm) {
            editSpermBank({
                accountId: this.newSperm.id,
                spermBankName: this.newSperm.spermBankName,
                phone: this.newSperm.spermBankPhone,
                coordinatorName: this.newSperm.coordinatorName,
                website: this.newSperm.spermBankWebsite,
                email: this.newSperm.spermBankEmail
            })
                .then(() => {
                    const updatedSperms = [...this.sperms];
                    updatedSperms[this.sperms.findIndex(s => s.id === this.newSperm.id)] = { ...this.newSperm };
                    this.sperms = updatedSperms;
                    this.showToast('Success', 'Sperm Bank updated successfully', 'success');
                    this.handleCancelSperm();
                })
                .catch(error => {
                    this.showToast('Error', 'Error updating sperm bank: ' + error.body.message, 'error');
                });
        } else {
            addSpermBank({
                donorId: this.donorId,
                spermBankName: this.newSperm.spermBankName,
                phone: this.newSperm.spermBankPhone,
                coordinatorName: this.newSperm.coordinatorName,
                website: this.newSperm.spermBankWebsite,
                email: this.newSperm.spermBankEmail
            })
                .then(result => {
                    this.sperms = [...this.sperms, { ...this.newSperm, id: result, isFromPrimaryBanks: false }];
                    this.showToast('Success', 'Sperm Bank added successfully', 'success');
                    this.handleCancelSperm();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding sperm bank: ' + error.body.message, 'error');
                });
        }
    }

    handleAddClinicClick() {
        this.showClinicForm = true;
        this.isEditingClinic = false;
        this.newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '' };
    }

    handleEditClinic(event) {
        const index = event.target.dataset.index;
        this.isEditingClinic = true;
        this.newClinic = { ...this.clinics[index] };
        this.showClinicForm = true;
    }

    handleDeleteClinic(event) {
        const index = event.target.dataset.index;
        this.showDeletePopup = true;
        this.deleteItemType = 'Clinic';
        this.deleteItemIndex = index;
        this.deleteItemName = this.clinics[index].clinicName;
        this.deleteItemId = this.clinics[index].id;
    }

    handleClinicFieldChange(event) {
        const field = event.target.dataset.field;

        this.newClinic = { ...this.newClinic, [field]: event.target.value };
    }

    handleCancelClinic() {
        this.showClinicForm = false;
        this.newClinic = { id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '' };
        this.isEditingClinic = false;
    }

    handleSaveClinic() {
        if (!this.newClinic.clinicName) {
            this.showToast('Error', 'Clinic Name is required', 'error');
            return;
        }

        if (this.isEditingClinic) {
            editClinic({
                accountId: this.newClinic.id,
                clinicName: this.newClinic.clinicName,
                phone: this.newClinic.phone,
                coordinatorName: this.newClinic.coordinatorName,
                website: this.newClinic.website,
                cityState: this.newClinic.cityState,
                email: this.newClinic.coordinatorEmail
            })
                .then(() => {
                    const updatedClinics = [...this.clinics];
                    updatedClinics[this.clinics.findIndex(c => c.id === this.newClinic.id)] = { ...this.newClinic };
                    this.clinics = updatedClinics;
                    this.showToast('Success', 'Clinic updated successfully', 'success');
                    this.handleCancelClinic();
                })
                .catch(error => {
                    this.showToast('Error', 'Error updating clinic: ' + error.body.message, 'error');
                });
        } else {
            addClinic({
                donorId: this.donorId,
                clinicName: this.newClinic.clinicName,
                phone: this.newClinic.phone,
                coordinatorName: this.newClinic.coordinatorName,
                website: this.newClinic.website,
                cityState: this.newClinic.cityState,
                email: this.newClinic.coordinatorEmail
            })
                .then(result => {
                    this.clinics = [...this.clinics, { ...this.newClinic, id: result }];
                    this.showToast('Success', 'Clinic added successfully', 'success');
                    this.handleCancelClinic();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding clinic: ' + error.body.message, 'error');
                });
        }
    }

    handleAddAttorneyClick() {
        this.showAttorneyForm = true;
        this.isEditingAttorney = false;
        this.newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '' };
    }

    handleEditAttorney(event) {
        const index = event.target.dataset.index;
        this.isEditingAttorney = true;
        this.newAttorney = { ...this.attorneys[index] };
        this.showAttorneyForm = true;
    }

    handleDeleteAttorney(event) {
        const index = event.target.dataset.index;
        this.showDeletePopup = true;
        this.deleteItemType = 'Attorney';
        this.deleteItemIndex = index;
        this.deleteItemName = this.attorneys[index].attorneyName;
        this.deleteItemId = this.attorneys[index].id;
    }

    handleAttorneyFieldChange(event) {
        const field = event.target.dataset.field;
        this.newAttorney = { ...this.newAttorney, [field]: event.target.value };
    }

    handleCancelAttorney() {
        this.showAttorneyForm = false;
        this.newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '' };
        this.isEditingAttorney = false;
    }

    handleSaveAttorney() {
        if (!this.newAttorney.attorneyName) {
            this.showToast('Error', 'Attorney Name is required', 'error');
            return;
        }

        if (this.isEditingAttorney) {
            editAttorney({
                accountId: this.newAttorney.id,
                attorneyName: this.newAttorney.attorneyName,
                phone: this.newAttorney.phone,
                lawFirm: this.newAttorney.lawFirm,
                website: this.newAttorney.website,
                cityState: this.newAttorney.cityState,
                email: this.newAttorney.email
            })
                .then(() => {
                    const updatedAttorneys = [...this.attorneys];
                    updatedAttorneys[this.attorneys.findIndex(a => a.id === this.newAttorney.id)] = { ...this.newAttorney };
                    this.attorneys = updatedAttorneys;
                    this.showToast('Success', 'Attorney updated successfully', 'success');
                    this.handleCancelAttorney();
                })
                .catch(error => {
                    this.showToast('Error', 'Error updating attorney: ' + error.body.message, 'error');
                });
        } else {
            addAttorney({
                donorId: this.donorId,
                attorneyName: this.newAttorney.attorneyName,
                phone: this.newAttorney.phone,
                lawFirm: this.newAttorney.lawFirm,
                website: this.newAttorney.website,
                cityState: this.newAttorney.cityState,
                email: this.newAttorney.email
            })
                .then(result => {
                    this.attorneys = [...this.attorneys, { ...this.newAttorney, id: result }];
                    this.showToast('Success', 'Attorney added successfully', 'success');
                    this.handleCancelAttorney();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding attorney: ' + error.body.message, 'error');
                });
        }
    }

    handleAddRecipientClick() {
        this.showRecipientForm = true;
        this.isEditingRecipient = false;
        this.newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '' };
    }

    handleEditRecipient(event) {
        const index = event.target.dataset.index;
        this.isEditingRecipient = true;
        this.newRecipient = { ...this.recipients[index], firstName: '', lastName: this.recipients[index].Name };
        this.showRecipientForm = true;
    }

    handleDeleteRecipient(event) {
        const index = event.target.dataset.index;
        this.showDeletePopup = true;
        this.deleteItemType = 'Recipient';
        this.deleteItemIndex = index;
        this.deleteItemName = this.recipients[index].Name;
        this.deleteItemId = this.recipients[index].id;
    }

    handleRecipientFieldChange(event) {
        const field = event.target.dataset.field;
        this.newRecipient = { ...this.newRecipient, [field]: event.target.value };
    }

    handleCancelRecipient() {
        this.showRecipientForm = false;
        this.newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '' };
        this.isEditingRecipient = false;
    }

    handleSaveRecipient() {
        if (!this.newRecipient.lastName) {
            this.showToast('Error', 'Recipient Last Name is required', 'error');
            return;
        }

        if (this.isEditingRecipient) {
            editRecipient({
                accountId: this.newRecipient.id,
                firstName: this.newRecipient.firstName,
                lastName: this.newRecipient.lastName,
                phone: this.newRecipient.phone,
                email: this.newRecipient.email,
                additionalInfo: this.newRecipient.additionalInfo
            })
                .then(() => {
                    const updatedRecipients = [...this.recipients];
                    updatedRecipients[this.recipients.findIndex(r => r.id === this.newRecipient.id)] = {
                        ...this.newRecipient,
                        Name: (this.newRecipient.firstName ? this.newRecipient.firstName + ' ' : '') + this.newRecipient.lastName
                    };
                    this.recipients = updatedRecipients;
                    this.showToast('Success', 'Recipient updated successfully', 'success');
                    this.handleCancelRecipient();
                })
                .catch(error => {
                    this.showToast('Error', 'Error updating recipient: ' + error.body.message, 'error');
                });
        } else {
            addRecipient({
                donorId: this.donorId,
                firstName: this.newRecipient.firstName,
                lastName: this.newRecipient.lastName,
                phone: this.newRecipient.phone,
                email: this.newRecipient.email,
                additionalInfo: this.newRecipient.additionalInfo
            })
                .then(result => {
                    this.recipients = [...this.recipients, {
                        ...this.newRecipient,
                        id: result,
                        Name: (this.newRecipient.firstName ? this.newRecipient.firstName + ' ' : '') + this.newRecipient.lastName
                    }];
                    this.showToast('Success', 'Recipient added successfully', 'success');
                    this.handleCancelRecipient();
                })
                .catch(error => {
                    this.showToast('Error', 'Error adding recipient: ' + error.body.message, 'error');
                });
        }
    }

    handleDeleteYes() {
        const deleteHandlers = {
            'Agency': deleteAgency,
            'Sperm': deleteSpermBank,
            'Clinic': deleteClinic,
            'Attorney': deleteAttorney,
            'Recipient': deleteRecipient
        };
        const deleteItemIdField = {
            'Agency': 'agencyId',
            'Sperm': 'spermBankId',
            'Clinic': 'clinicId',
            'Attorney': 'attorneyId',
            'Recipient': 'recipientId'
        };

        const handler = deleteHandlers[this.deleteItemType];
        const idField = deleteItemIdField[this.deleteItemType];

        if (handler) {
            handler({
                donorId: this.donorId,
                [idField]: this.deleteItemId
            })
                .then(() => {
                    const arrayName = {
                        'Agency': 'agencies',
                        'Sperm': 'sperms',
                        'Clinic': 'clinics',
                        'Attorney': 'attorneys',
                        'Recipient': 'recipients'
                    }[this.deleteItemType];
                    this[arrayName] = this[arrayName].filter((_, index) => index !== parseInt(this.deleteItemIndex));
                    this.showToast('Success', `${this.deleteItemType} deleted successfully`, 'success');
                    this.handleDeleteNo();
                })
                .catch(error => {
                    this.showToast('Error', `Error deleting ${this.deleteItemType.toLowerCase()}: ${error.body.message}`, 'error');
                    this.handleDeleteNo();
                });
        }
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteItemType = '';
        this.deleteItemIndex = -1;
        this.deleteItemName = '';
        this.deleteItemId = '';
    }

    handleConfirmationChange(event) {
        this.isConfirmed = event.target.checked;
    }

    handleDonorHippaBack() {
        const backEvent = new CustomEvent('back');
        this.dispatchEvent(backEvent);
    }

    handleDonorHippaNext() {


        /*if (!this.dob) {
            this.showToast('Error', 'Date of Birth is required', 'error');
            return;
        }
        if (this.dobError) {
            this.showToast('Error', this.dobError, 'error');
            return;
        }
        if (!this.isConfirmed) {
            this.showToast('Error', 'Please confirm the information provided', 'error');
            return;
        }*/
        let isValid = true;

        // Step 1: Field-level validation
        this.template.querySelectorAll('lightning-input').forEach(input => {
            const fieldsMap = new Map([
                ['dob', 'Please enter date of birth'],
                ['confirmation', 'Please confirm that the information is accurate.']
            ]);

            if (fieldsMap.has(input.name)) {
                if (input.name === 'confirmation') {
                    if (!input.checked) {
                        input.setCustomValidity(fieldsMap.get(input.name));
                        input.reportValidity();
                        isValid = false;
                    } else {
                        input.setCustomValidity('');
                        input.reportValidity();
                    }
                } else if (input.name === 'dob') {
                    if (!input.value) {
                        input.setCustomValidity(fieldsMap.get(input.name));
                        input.reportValidity();
                        isValid = false;
                    } else if (this.dobError) {
                        // DOB has a custom error, like invalid date format, underage, etc.
                        input.setCustomValidity(this.dobError);
                        input.reportValidity();
                        this.showToast('Error', this.dobError, 'error');
                        isValid = false;
                    } else {
                        input.setCustomValidity('');
                        input.reportValidity();
                    }
                } else {
                    // Clear for other fields if valid
                    input.setCustomValidity('');
                    input.reportValidity();
                }
            }
        });

        // Step 2: Stop submission if invalid
        if (!isValid) {
            return;
        }

        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        this.contactObj.firstName = this.legalNamesri.firstName;
        this.contactObj.lastName = this.legalNamesri.lastName;
        this.contactObj.dateOfBirth = this.dob;
        this.contactObj.state = this.address.state; // Added
    this.contactObj.city = this.address.city; // Added
    this.contactObj.street = this.address.street; // Added
    this.contactObj.pincode = this.address.pincode; // Added
    this.contactObj.additionalInfo = this.address.additionalInfo; // Added
        updateDonorName({
            donorId: this.donorId,
            firstName: this.legalNamesri.firstName,
            lastName: this.legalNamesri.lastName,
            dob: this.dob,
            state: this.address.state, // Added
        city: this.address.city, // Added
        street: this.address.street, // Added
        pincode: this.address.pincode, // Added
        additionalInfo: this.address.additionalInfo // Added
        })
            .then(() => {
                const nextEvent = new CustomEvent('next', { detail: this.contactObj });
                this.dispatchEvent(nextEvent);
            })
            .catch(error => {
                this.showToast('Error', 'Error saving donor information: ' + error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}