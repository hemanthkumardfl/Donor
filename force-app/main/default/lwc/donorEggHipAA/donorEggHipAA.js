import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import spermDonor from '@salesforce/apex/HipAAUtilityClass.spermDonor';
import updateDonorName from '@salesforce/apex/HipAAUtilityClass.updateDonorName';
import deleteSpermBank from '@salesforce/apex/HipAAUtilityClass.deleteSpermBank';
import addSpermBank from '@salesforce/apex/HipAAUtilityClass.addSpermBank';
import editSpermBank from '@salesforce/apex/HipAAUtilityClass.editSpermBank';
import deleteAgency from '@salesforce/apex/HipAAUtilityClass.deleteAgency';
import addAgency from '@salesforce/apex/HipAAUtilityClass.addAgency';
import editAgency from '@salesforce/apex/HipAAUtilityClass.editAgency';
import deleteClinic from '@salesforce/apex/HipAAUtilityClass.deleteClinic';
import addClinic from '@salesforce/apex/HipAAUtilityClass.addClinic';
import editClinic from '@salesforce/apex/HipAAUtilityClass.editClinic';
import deleteAttorney from '@salesforce/apex/HipAAUtilityClass.deleteAttorney';
import addAttorney from '@salesforce/apex/HipAAUtilityClass.addAttorney';
import editAttorney from '@salesforce/apex/HipAAUtilityClass.editAttorney';
import deleteRecipient from '@salesforce/apex/HipAAUtilityClass.deleteRecipient';
import addRecipient from '@salesforce/apex/HipAAUtilityClass.addRecipient';
import editRecipient from '@salesforce/apex/HipAAUtilityClass.editRecipient';
import fetchSpermBankRecord from '@salesforce/apex/UtilityClass.fetchSpermBankRecord';
//import fetchAgencyRecord from '@salesforce/apex/HipAAUtilityClass.fetchAgencyRecord';
//import fetchClinicRecord from '@salesforce/apex/HipAAUtilityClass.fetchClinicRecord';
import addlookupSpermBank from '@salesforce/apex/HipAAUtilityClass.addlookupSpermBank';
//import addlookupAgency from '@salesforce/apex/HipAAUtilityClass.addlookupAgency';
import addlookupClinic from '@salesforce/apex/HipAAUtilityClass.addlookupClinic';
import createCoordinator from '@salesforce/apex/UtilityClass.createCoordinator';

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
    @track showAgencyPicker = false;
    @track showSpermForm = false;
    @track showSpermPicker = false;
    @track showClinicForm = false;
    @track showClinicPicker = false;
    @track showAttorneyForm = false;
    @track showRecipientForm = false;
    @track showMissedCycles = false;
    @track unselectedCycles = [];
    @track totalDonationsCount = 0;
    @track totalSelectedCycles = 0;
    @track cycleList = [];
    @track newAgency = {
        id: '', agencyName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '',
        accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
        showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
        coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
        disableAddCoordinatorIcon: true,
        cycles: []
    };
    @track newSperm = {
        id: '', spermBankName: '', spermBankPhone: '', coordinatorName: '', spermBankWebsite: '', spermBankEmail: '',
        accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
        showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
        coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
        disableAddCoordinatorIcon: true,
        cycles: []
    };
    @track newClinic = {
        id: '', clinicName: '', phone: '', coordinatorName: '', website: '', cityState: '', coordinatorEmail: '',
        accountId: '', coordinatorId: '', disableInputs: false, disableAddIcon: true,
        showNoCoordinatorRecordsErrorMessage: false, isAdditionalCoordinators: false,
        coordinatorUserInputsObj: { firstName: '', lastName: '', phone: '', coordinatorId: '', parentId: '', fullName: '', isAllow: false, isCoordinatorFirstNameBlank: false },
        disableAddCoordinatorIcon: true,
        cycles: []
    };
    @track newAttorney = { id: '', attorneyName: '', phone: '', lawFirm: '', website: '', cityState: '', email: '', disableInputs: false, cycles: [] };
    @track newRecipient = { id: '', firstName: '', lastName: '', phone: '', email: '', additionalInfo: '', disableInputs: false, cycles: [] };
    @track isConfirmed = false;
    @track showDeletePopup = false;
    @track deleteItemType = '';
    @track deleteItemIndex = -1;
    @track deleteItemName = '';
    @track deleteItemId = '';
    @track noAgencyChecked = false;
    @track noSpermChecked = false;
    @track noClinicChecked = false;
    @track isEditingAgency = false;
    @track isEditingSperm = false;
    @track isEditingClinic = false;
    @track isEditingAttorney = false;
    @track isEditingRecipient = false;
    @track selectedSpermBankId = '';
    @track selectedAgencyId = '';
    @track selectedClinicId = '';
    @track loadSpinner = false;
    @track donorType = 'egg';

    get isAddButtonDisabled() {
        return !this.selectedSpermBankId;
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

    get showCycleCheckboxes() {
        return this.contactObj.donorType === 'egg' && this.totalDonationsCount > 0;
    }

    get disablePopupBackBtn() {
        return this.unselectedCycles.length > 0;
    }

    get disablePopupNextBtn() {
        return this.unselectedCycles.length > 0;
    }

    get showNextFromMissedPopupButton() {
        return this.unselectedCycles.length === 0;
    }

    async connectedCallback() {
        try {

            this.contactObj = JSON.parse(JSON.stringify(this.contactObj))

            let isEgg = (this.contactObj.donorType == 'egg');
            let isSperm = (this.contactObj.donorType == 'sperm');
            let spermBankList = [];
            let eggAgencyList = [];
            let clinicList = [];
            let attorneyList = [];
            let recipientList = [];


            
            this.donorId = this.contactObj.donorId || '003QL00000wvXvbYAE';
            this.showagencySection = this.donorType === 'egg';
            this.showSpermBankSection = this.donorType !== 'egg';
            this.showclinicSection = true;
            this.showattorneySection = this.donorType == 'egg';
            this.showrecipientSection = true;

            this.legalNamesri = {
                firstName: this.contactObj.firstName || '',
                lastName: this.contactObj.lastName || ''
            };
            this.legalName = { ...this.legalNamesri };
            this.dob = this.contactObj.dob || '';
            this.address = {
                state: this.contactObj.state || '',
                city: this.contactObj.city || '',
                street: this.contactObj.street || '',
                pincode: this.contactObj.pincode || '',
                additionalInfo: this.contactObj.additionalInfo || ''
            };

            this.totalDonationsCount = 5;
            this.initializeCycles();

            const result = await spermDonor({ donorId: this.donorId });
            console.log('spermDonor result:', JSON.stringify(result));

            if (result.parentdetails) {
                this.legalNamesri = {
                    firstName: result.parentdetails.firstName || this.legalNamesri.firstName,
                    lastName: result.parentdetails.lastName || this.legalNamesri.lastName
                };
                this.legalName = { ...this.legalNamesri };
                this.dob = result.parentdetails.dob || this.dob;
                this.address = {
                    state: result.parentdetails.state || this.address.state,
                    city: result.parentdetails.city || this.address.city,
                    street: result.parentdetails.street || this.address.street,
                    pincode: result.parentdetails.pincode || this.address.pincode,
                    additionalInfo: result.parentdetails.additionalInfo || this.address.additionalInfo
                };
                this.contactObj.donorType = result.parentdetails.donorType || this.contactObj.donorType;
            }

            this.agencies = Array.isArray(result.Agencylist) ? result.Agencylist.map(item => ({
                id: item.Id || `agency_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                agencyName: item.Name || '',
                phone: item.Phone || '',
                coordinatorName: item.coordinatorName || '',
                coordinatorId: item.coordinatorId || '',
                website: item.website || '',
                cityState: item.cityState || '',
                coordinatorEmail: item.email || '',
                accountId: item.Id || '',
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: item.coordinatorFirstName || '',
                    lastName: item.coordinatorLastName || '',
                    phone: item.coordinatorPhone || '',
                    coordinatorId: item.coordinatorId || '',
                    parentId: item.Id || '',
                    fullName: item.coordinatorName || '',
                    isAllow: !!item.coordinatorId,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: !!item.coordinatorId,
                cycles: item.cycles || []
            })) : [];

            this.sperms = Array.isArray(result.spermlist) ? result.spermlist.map(item => ({
                id: item.Id || `sperm_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                spermBankName: item.Name || '',
                spermBankPhone: item.Phone || '',
                coordinatorName: item.coordinatorName || '',
                coordinatorId: item.coordinatorId || '',
                spermBankWebsite: item.website || '',
                spermBankEmail: item.email || '',
                accountId: item.Id || '',
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: item.coordinatorFirstName || '',
                    lastName: item.coordinatorLastName || '',
                    phone: item.coordinatorPhone || '',
                    coordinatorId: item.coordinatorId || '',
                    parentId: item.Id || '',
                    fullName: item.coordinatorName || '',
                    isAllow: !!item.coordinatorId,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: !!item.coordinatorId,
                cycles: item.cycles || []
            })) : [];

            this.clinics = Array.isArray(result.Cliniclist) ? result.Cliniclist.map(item => ({
                id: item.Id || `clinic_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                clinicName: item.Name || '',
                phone: item.Phone || '',
                coordinatorName: item.coordinatorName || '',
                coordinatorId: item.coordinatorId || '',
                website: item.website || '',
                cityState: item.cityState || '',
                coordinatorEmail: item.email || '',
                accountId: item.Id || '',
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: item.coordinatorFirstName || '',
                    lastName: item.coordinatorLastName || '',
                    phone: item.coordinatorPhone || '',
                    coordinatorId: item.coordinatorId || '',
                    parentId: item.Id || '',
                    fullName: item.coordinatorName || '',
                    isAllow: !!item.coordinatorId,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: !!item.coordinatorId,
                cycles: item.cycles || []
            })) : [];

            this.attorneys = Array.isArray(result.Attorneylist) ? result.Attorneylist.map(item => ({
                id: item.Id || `attorney_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                attorneyName: item.Name || '',
                phone: item.Phone || '',
                lawFirm: item.lawFirm || item.coordinatorName || '',
                website: item.website || '',
                cityState: item.cityState || '',
                email: item.email || '',
                isEditable: true,
                cycles: item.cycles || []
            })) : [];

            this.recipients = Array.isArray(result.Recipientlist) ? result.Recipientlist.map(item => ({
                id: item.Id || `recipient_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                firstName: item.firstName || '',
                lastName: item.lastName || '',
                Name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
                phone: item.Phone || '',
                email: item.email || '',
                additionalInfo: item.additionalInfo || '',
                isEditable: true,
                cycles: item.cycles || []
            })) : [];

            this.updateCycleList();
            this.calculateTotalSelectedCycles();
        } catch (error) {
            console.error('Error loading donor data:', error);
            this.showToast('Error', `Failed to load donor data: ${error.body?.message || error.message}`, 'error');
        }
    }

    initializeCycles() {
        if (this.contactObj.donorType === 'egg' && this.totalDonationsCount > 0) {
            this.cycleList = Array.from({ length: this.totalDonationsCount }, (_, index) => ({
                id: `cycle_${index + 1}`,
                cycleNumber: `${index + 1}`,
                disabled: false
            }));
        }
    }

    updateCycleList() {
        const allSelectedCycles = [
            ...this.agencies.flatMap(agency => agency.cycles),
            ...this.clinics.flatMap(clinic => clinic.cycles),
            ...this.attorneys.flatMap(attorney => attorney.cycles),
            ...this.recipients.flatMap(recipient => recipient.cycles)
        ];
        this.cycleList = this.cycleList.map(cycle => ({
            ...cycle,
            disabled: allSelectedCycles.includes(cycle.cycleNumber)
        }));
        this.unselectedCycles = this.cycleList.filter(cycle => !allSelectedCycles.includes(cycle.cycleNumber));
    }

    calculateTotalSelectedCycles() {
        this.totalSelectedCycles = [
            ...new Set([
                ...this.agencies.flatMap(agency => agency.cycles),
                ...this.clinics.flatMap(clinic => clinic.cycles),
                ...this.attorneys.flatMap(attorney => attorney.cycles),
                ...this.recipients.flatMap(recipient => recipient.cycles)
            ])
        ].length;
    }

    getEntity(dataType) {
        switch (dataType) {
            case 'agency': return this.newAgency;
            case 'sperm': return this.newSperm;
            case 'clinic': return this.newClinic;
            case 'attorney': return this.newAttorney;
            case 'recipient': return this.newRecipient;
            default: throw new Error('Invalid data type');
        }
    }

    updateEntity(dataType, entity) {
        switch (dataType) {
            case 'agency': this.newAgency = { ...entity }; break;
            case 'sperm': this.newSperm = { ...entity }; break;
            case 'clinic': this.newClinic = { ...entity }; break;
            case 'attorney': this.newAttorney = { ...entity }; break;
            case 'recipient': this.newRecipient = { ...entity }; break;
            default: throw new Error('Invalid data type');
        }
    }

    handleCycleChange(event) {
        const cycleNumber = event.target.value;
        const isChecked = event.target.checked;
        const dataType = event.target.dataset.type;
        const entity = this.getEntity(dataType);

        if (isChecked) {
            if (!entity.cycles.includes(cycleNumber)) {
                entity.cycles = [...entity.cycles, cycleNumber];
                this.totalSelectedCycles++;
            }
        } else {
            entity.cycles = entity.cycles.filter(id => id !== cycleNumber);
            this.totalSelectedCycles--;
        }

        this.updateEntity(dataType, entity);
        this.updateCycleList();
    }

    handleSpermBankChange(event) {
        this.nameConfirmation = event.target.value;
        this.isYesChecked = this.nameConfirmation === 'Yes';
        this.isNoChecked = this.nameConfirmation === 'No';
        this.isDisabled = this.isYesChecked;
        if (this.isYesChecked) {
            this.legalName = { ...this.legalNamesri };
        }
    }

    handleLegalNameChange(event) {
        const field = event.target.name;
        this.legalName[field] = event.target.value;
    }

    handleDobChange(event) {
        this.dob = event.target.value;
        this.dobError = this.validateDob(this.dob) ? '' : 'You must be at least 18 years old.';
    }

    handleAddressChange(event) {
        const field = event.target.dataset.field;
        this.address[field] = event.target.value;
    }

    async handleAgencySelect(event) {
        try {
            this.loadSpinner = true;
            const { id, name } = event.detail;
            this.selectedAgencyId = id || '';
            this.newAgency = {
                ...this.newAgency,
                accountId: id,
                agencyName: name || '',
                phone: '',
                coordinatorName: '',
                coordinatorId: '',
                website: '',
                cityState: '',
                coordinatorEmail: '',
                disableInputs: !!id,
                disableAddIcon: !id,
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: '',
                    lastName: '',
                    phone: '',
                    coordinatorId: '',
                    parentId: id,
                    fullName: '',
                    isAllow: false,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: true,
                cycles: []
            };
            this.noAgencyChecked = !id;
            if (id) {
                const agencyDetails = await fetchSpermBankRecord({ accountId: this.selectedAgencyId })
                this.newAgency = {
                    ...this.newAgency,
                    phone: agencyDetails.Phone || '',
                    coordinatorName: agencyDetails.coordinatorName || '',
                    coordinatorId: agencyDetails.coordinatorId || '',
                    website: agencyDetails.website || '',
                    cityState: agencyDetails.cityState || '',
                    coordinatorEmail: agencyDetails.email || '',
                    coordinatorUserInputsObj: {
                        ...this.newAgency.coordinatorUserInputsObj,
                        firstName: agencyDetails.coordinatorFirstName || '',
                        lastName: agencyDetails.coordinatorLastName || '',
                        phone: agencyDetails.coordinatorPhone || '',
                        coordinatorId: agencyDetails.coordinatorId || '',
                        fullName: agencyDetails.coordinatorName || '',
                        isAllow: !!agencyDetails.coordinatorId
                    },
                    disableAddCoordinatorIcon: !!agencyDetails.coordinatorId
                };
                this.showAgencyPicker = false;
                this.showAgencyForm = true;
                this.showAgencyPlusButton = true;
            }
        } catch (error) {
            console.error('Error in handleAgencySelect:', error);
            this.showToast('Error', `Error selecting agency: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleNoAgencyData(event) {
        this.noAgencyChecked = true;
        this.newAgency.disableAddIcon = false;
        this.showAgencyPlusButton = true;
        this.showToast('Info', 'No agency found. Click the add icon to add a new agency manually.', 'info');
    }

    async handleSpermBankSelect(event) {
        try {
            this.loadSpinner = true;
            const { id, name } = event.detail;
            this.selectedSpermBankId = id || '';
            this.newSperm = {
                ...this.newSperm,
                accountId: id,
                spermBankName: name || '',
                spermBankPhone: '',
                coordinatorName: '',
                coordinatorId: '',
                spermBankWebsite: '',
                spermBankEmail: '',
                disableInputs: !!id,
                disableAddIcon: !id,
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: '',
                    lastName: '',
                    phone: '',
                    coordinatorId: '',
                    parentId: id,
                    fullName: '',
                    isAllow: false,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: true,
                cycles: []
            };
            this.noSpermChecked = !id;
            if (id) {
                const spermBankDetails = await fetchSpermBankRecord({ accountId: this.selectedAgencyId });
                this.newSperm = {
                    ...this.newSperm,
                    spermBankPhone: spermBankDetails.Phone || '',
                    coordinatorName: spermBankDetails.coordinatorName || '',
                    coordinatorId: spermBankDetails.coordinatorId || '',
                    spermBankWebsite: spermBankDetails.website || '',
                    spermBankEmail: spermBankDetails.email || '',
                    coordinatorUserInputsObj: {
                        ...this.newSperm.coordinatorUserInputsObj,
                        firstName: spermBankDetails.coordinatorFirstName || '',
                        lastName: spermBankDetails.coordinatorLastName || '',
                        phone: spermBankDetails.coordinatorPhone || '',
                        coordinatorId: spermBankDetails.coordinatorId || '',
                        fullName: spermBankDetails.coordinatorName || '',
                        isAllow: !!spermBankDetails.coordinatorId
                    },
                    disableAddCoordinatorIcon: !!spermBankDetails.coordinatorId
                };
                this.showSpermPicker = false;
                this.showSpermForm = true;
                this.showPlusButton = true;
            }
        } catch (error) {
            console.error('Error in handleSpermBankSelect:', error);
            this.showToast('Error', `Error selecting sperm bank: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleNoData(event) {
        this.noSpermChecked = true;
        this.newSperm.disableAddIcon = false;
        this.showPlusButton = true;
        this.showToast('Info', 'No sperm bank found. Click the add icon to add a new sperm bank manually.', 'info');
    }

    async handleClinicSelect(event) {
        try {
            this.loadSpinner = true;
            const { id, name } = event.detail;
            this.selectedClinicId = id || '';
            this.newClinic = {
                ...this.newClinic,
                accountId: id,
                clinicName: name || '',
                phone: '',
                coordinatorName: '',
                coordinatorId: '',
                website: '',
                cityState: '',
                coordinatorEmail: '',
                disableInputs: !!id,
                disableAddIcon: !id,
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: '',
                    lastName: '',
                    phone: '',
                    coordinatorId: '',
                    parentId: id,
                    fullName: '',
                    isAllow: false,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: true,
                cycles: []
            };
            this.noClinicChecked = !id;
            if (id) {
                const clinicDetails = await await fetchSpermBankRecord({ accountId: this.selectedAgencyId });
                this.newClinic = {
                    ...this.newClinic,
                    phone: clinicDetails.Phone || '',
                    coordinatorName: clinicDetails.coordinatorName || '',
                    coordinatorId: clinicDetails.coordinatorId || '',
                    website: clinicDetails.website || '',
                    cityState: clinicDetails.cityState || '',
                    coordinatorEmail: clinicDetails.email || '',
                    coordinatorUserInputsObj: {
                        ...this.newClinic.coordinatorUserInputsObj,
                        firstName: clinicDetails.coordinatorFirstName || '',
                        lastName: clinicDetails.coordinatorLastName || '',
                        phone: clinicDetails.coordinatorPhone || '',
                        coordinatorId: clinicDetails.coordinatorId || '',
                        fullName: clinicDetails.coordinatorName || '',
                        isAllow: !!clinicDetails.coordinatorId
                    },
                    disableAddCoordinatorIcon: !!clinicDetails.coordinatorId
                };
                this.showClinicPicker = false;
                this.showClinicForm = true;
                this.showClinicPlusButton = true;
            }
        } catch (error) {
            console.error('Error in handleClinicSelect:', error);
            this.showToast('Error', `Error selecting clinic: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleNoClinicData(event) {
        this.noClinicChecked = true;
        this.newClinic.disableAddIcon = false;
        this.showClinicPlusButton = true;
        this.showToast('Info', 'No clinic found. Click the add icon to add a new clinic manually.', 'info');
    }

    handleCoordinatorSelect(event) {
        try {
            const { id, name, dataType } = event.detail;
            const entity = this.getEntity(dataType);
            entity.coordinatorId = id || '';
            entity.coordinatorName = name || '';
            entity.coordinatorUserInputsObj = {
                ...entity.coordinatorUserInputsObj,
                coordinatorId: id || '',
                fullName: name || '',
                isAllow: !!id,
                isCoordinatorFirstNameBlank: false
            };
            entity.disableAddCoordinatorIcon = !!id;
            entity.showNoCoordinatorRecordsErrorMessage = false;
            entity.isAdditionalCoordinators = false;
            this.updateEntity(dataType, entity);
        } catch (error) {
            console.error('Error in handleCoordinatorSelect:', error);
            this.showToast('Error', `Error selecting coordinator: ${error.body?.message || error.message}`, 'error');
        }
    }

    handleNoCoordinatorData(event) {
        const dataType = event.target.dataset.type;
        const entity = this.getEntity(dataType);
        entity.showNoCoordinatorRecordsErrorMessage = true;
        entity.disableAddCoordinatorIcon = false;
        this.updateEntity(dataType, entity);
        this.showToast('Info', 'No coordinators found. Click the add icon to add a coordinator manually.', 'info');
    }

    handleAddCoordinator(event) {
        const dataType = event.target.dataset.type;
        const entity = this.getEntity(dataType);
        if (!entity.accountId && !entity.isAdditionalCoordinators && dataType !== 'attorney' && dataType !== 'recipient') {
            this.showToast('Error', `Please select or add a ${dataType} before adding a coordinator.`, 'error');
            return;
        }
        entity.isAdditionalCoordinators = true;
        entity.coordinatorUserInputsObj = {
            ...entity.coordinatorUserInputsObj,
            firstName: '',
            lastName: '',
            phone: '',
            coordinatorId: '',
            fullName: '',
            isAllow: false,
            isCoordinatorFirstNameBlank: false
        };
        entity.disableAddCoordinatorIcon = true;
        this.updateEntity(dataType, entity);
    }

    handleCoordinatorInputs(event) {
        const { name, value, dataset: { type: dataType } } = event.target;
        const entity = this.getEntity(dataType);
        entity.coordinatorUserInputsObj[name] = value;
        entity.coordinatorUserInputsObj.isCoordinatorFirstNameBlank = name === 'firstName' && !value;
        entity.coordinatorName = `${entity.coordinatorUserInputsObj.firstName || ''} ${entity.coordinatorUserInputsObj.lastName || ''}`.trim();
        entity.coordinatorUserInputsObj.fullName = entity.coordinatorName;
        this.updateEntity(dataType, entity);
    }

    async handleCoordinatorSave(event) {
        const dataType = event.target.dataset.type;
        const entity = this.getEntity(dataType);
        if (!entity.coordinatorUserInputsObj.firstName) {
            entity.coordinatorUserInputsObj.isCoordinatorFirstNameBlank = true;
            this.updateEntity(dataType, entity);
            this.showToast('Error', 'Coordinator first name is required.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            const coordinatorId = await createCoordinator({
                firstName: entity.coordinatorUserInputsObj.firstName,
                lastName: entity.coordinatorUserInputsObj.lastName,
                phone: entity.coordinatorUserInputsObj.phone,
                parentId: entity.accountId,
                parentObject: dataType === 'agency' ? 'Account' : dataType === 'sperm' ? 'Account' : dataType === 'clinic' ? 'Account' : ''
            });
            entity.coordinatorId = coordinatorId;
            entity.coordinatorName = `${entity.coordinatorUserInputsObj.firstName} ${entity.coordinatorUserInputsObj.lastName}`.trim();
            entity.coordinatorUserInputsObj = {
                ...entity.coordinatorUserInputsObj,
                coordinatorId: coordinatorId,
                fullName: entity.coordinatorName,
                isAllow: true,
                isCoordinatorFirstNameBlank: false
            };
            entity.isAdditionalCoordinators = false;
            entity.disableAddCoordinatorIcon = true;
            entity.showNoCoordinatorRecordsErrorMessage = false;
            this.updateEntity(dataType, entity);
            this.showToast('Success', 'Coordinator added successfully.', 'success');
        } catch (error) {
            console.error('Error in handleCoordinatorSave:', error);
            this.showToast('Error', `Error saving coordinator: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleAgencyFieldChange(event) {
        const field = event.target.dataset.field;
        this.newAgency[field] = event.target.value;
    }

    handleSpermFieldChange(event) {
        const field = event.target.dataset.field;
        this.newSperm[field] = event.target.value;
    }

    handleClinicFieldChange(event) {
        const field = event.target.dataset.field;
        this.newClinic[field] = event.target.value;
    }

    handleAttorneyFieldChange(event) {
        const field = event.target.dataset.field;
        this.newAttorney[field] = event.target.value;
    }

    handleRecipientFieldChange(event) {
        const field = event.target.dataset.field;
        this.newRecipient[field] = event.target.value;
        if (field === 'firstName' || field === 'lastName') {
            this.newRecipient.Name = `${this.newRecipient.firstName || ''} ${this.newRecipient.lastName || ''}`.trim();
        }
    }

    handleAddAgencyClick() {
        this.showAgencyPicker = true;
        this.showAgencyForm = false;
        this.isEditingAgency = false;
        this.deleteItemIndex = -1;
        this.newAgency = {
            id: `agency_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            agencyName: '',
            phone: '',
            coordinatorName: '',
            coordinatorId: '',
            website: '',
            cityState: '',
            coordinatorEmail: '',
            accountId: '',
            disableInputs: false,
            disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false,
            isAdditionalCoordinators: false,
            coordinatorUserInputsObj: {
                firstName: '',
                lastName: '',
                phone: '',
                coordinatorId: '',
                parentId: '',
                fullName: '',
                isAllow: false,
                isCoordinatorFirstNameBlank: false
            },
            disableAddCoordinatorIcon: true,
            cycles: []
        };
        this.noAgencyChecked = false;
        this.showAgencyPlusButton = false;
    }

    handlePlusAgencyClick() {
        this.showAgencyPicker = false;
        this.showAgencyForm = true;
        this.newAgency.disableInputs = false;
        this.newAgency.disableAddIcon = false;
        this.showAgencyPlusButton = true;
    }

    async handleAddNewAgencyClick() {
        if (!this.newAgency.agencyName) {
            this.showToast('Error', 'Agency/Egg Bank Name is required.', 'error');
            return;
        }
        if (this.showCycleCheckboxes && this.newAgency.cycles.length === 0) {
            this.showToast('Error', 'At least one donation cycle must be selected.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            let agencyId;
            if (this.newAgency.accountId && !this.isEditingAgency) {
                agencyId = await addlookupAgency({
                    donorId: this.donorId,
                    agencyId: this.newAgency.accountId,
                    coordinatorId: this.newAgency.coordinatorId,
                    coordinatorFirstName: this.newAgency.coordinatorUserInputsObj.firstName,
                    coordinatorLastName: this.newAgency.coordinatorUserInputsObj.lastName,
                    coordinatorPhone: this.newAgency.coordinatorUserInputsObj.phone,
                    coordinatorName: this.newAgency.coordinatorName,
                    cycles: this.newAgency.cycles
                });
            } else {
                const apexMethod = this.isEditingAgency ? editAgency : addAgency;
                agencyId = await apexMethod({
                    donorId: this.donorId,
                    agencyId: this.newAgency.id,
                    agencyName: this.newAgency.agencyName,
                    phone: this.newAgency.phone,
                    coordinatorName: this.newAgency.coordinatorName,
                    coordinatorId: this.newAgency.coordinatorId,
                    website: this.newAgency.website,
                    cityState: this.newAgency.cityState,
                    email: this.newAgency.coordinatorEmail,
                    cycles: this.newAgency.cycles
                });
            }
            const newAgency = {
                ...this.newAgency,
                id: agencyId || this.newAgency.id,
                isEditable: true,
                isFromPrimaryBanks: !!this.newAgency.accountId
            };
            if (this.isEditingAgency) {
                this.agencies = this.agencies.map((agency, index) =>
                    index === this.deleteItemIndex ? newAgency : agency
                );
            } else {
                this.agencies = [...this.agencies, newAgency];
            }
            this.showAgencyForm = false;
            this.showAgencyPicker = false;
            this.isEditingAgency = false;
            this.deleteItemIndex = -1;
            this.updateCycleList();
            this.calculateTotalSelectedCycles();
            this.showToast('Success', `Agency ${this.isEditingAgency ? 'updated' : 'added'} successfully.`, 'success');
        } catch (error) {
            console.error('Error in handleAddNewAgencyClick:', error);
            this.showToast('Error', `Error ${this.isEditingAgency ? 'updating' : 'adding'} agency: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleCancelAgency() {
        this.showAgencyForm = false;
        this.showAgencyPicker = false;
        this.isEditingAgency = false;
        this.deleteItemIndex = -1;
        this.newAgency = {
            id: '',
            agencyName: '',
            phone: '',
            coordinatorName: '',
            coordinatorId: '',
            website: '',
            cityState: '',
            coordinatorEmail: '',
            accountId: '',
            disableInputs: false,
            disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false,
            isAdditionalCoordinators: false,
            coordinatorUserInputsObj: {
                firstName: '',
                lastName: '',
                phone: '',
                coordinatorId: '',
                parentId: '',
                fullName: '',
                isAllow: false,
                isCoordinatorFirstNameBlank: false
            },
            disableAddCoordinatorIcon: true,
            cycles: []
        };
    }

    handleAddSpermClick() {
        this.showSpermPicker = true;
        this.showSpermForm = false;
        this.isEditingSperm = false;
        this.deleteItemIndex = -1;
        this.newSperm = {
            id: `sperm_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            spermBankName: '',
            spermBankPhone: '',
            coordinatorName: '',
            coordinatorId: '',
            spermBankWebsite: '',
            spermBankEmail: '',
            accountId: '',
            disableInputs: false,
            disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false,
            isAdditionalCoordinators: false,
            coordinatorUserInputsObj: {
                firstName: '',
                lastName: '',
                phone: '',
                coordinatorId: '',
                parentId: '',
                fullName: '',
                isAllow: false,
                isCoordinatorFirstNameBlank: false
            },
            disableAddCoordinatorIcon: true,
            cycles: []
        };
        this.noSpermChecked = false;
        this.showPlusButton = false;
    }

    handlePlusIconClick() {
        this.showSpermPicker = false;
        this.showSpermForm = true;
        this.newSperm.disableInputs = false;
        this.newSperm.disableAddIcon = false;
        this.showPlusButton = true;
    }

    async handleAddNewSpermBankClick() {
        if (!this.newSperm.spermBankName) {
            this.showToast('Error', 'Sperm Bank Name is required.', 'error');
            return;
        }
        if (this.showCycleCheckboxes && this.newSperm.cycles.length === 0) {
            this.showToast('Error', 'At least one donation cycle must be selected.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            let spermBankId;
            if (this.newSperm.accountId && !this.isEditingSperm) {
                spermBankId = await addlookupSpermBank({
                    donorId: this.donorId,
                    spermBankId: this.newSperm.accountId,
                    coordinatorId: this.newSperm.coordinatorId,
                    coordinatorFirstName: this.newSperm.coordinatorUserInputsObj.firstName,
                    coordinatorLastName: this.newSperm.coordinatorUserInputsObj.lastName,
                    coordinatorPhone: this.newSperm.coordinatorUserInputsObj.phone,
                    coordinatorName: this.newSperm.coordinatorName,
                    cycles: this.newSperm.cycles
                });
            } else {
                const apexMethod = this.isEditingSperm ? editSpermBank : addSpermBank;
                spermBankId = await apexMethod({
                    donorId: this.donorId,
                    spermBankId: this.newSperm.id,
                    spermBankName: this.newSperm.spermBankName,
                    phone: this.newSperm.spermBankPhone,
                    coordinatorName: this.newSperm.coordinatorName,
                    coordinatorId: this.newSperm.coordinatorId,
                    website: this.newSperm.spermBankWebsite,
                    email: this.newSperm.spermBankEmail,
                    cycles: this.newSperm.cycles
                });
            }
            const newSperm = {
                ...this.newSperm,
                id: spermBankId || this.newSperm.id,
                isEditable: true,
                isFromPrimaryBanks: !!this.newSperm.accountId
            };
            if (this.isEditingSperm) {
                this.sperms = this.sperms.map((sperm, index) =>
                    index === this.deleteItemIndex ? newSperm : sperm
                );
            } else {
                this.sperms = [...this.sperms, newSperm];
            }
            this.showSpermForm = false;
            this.showSpermPicker = false;
            this.isEditingSperm = false;
            this.deleteItemIndex = -1;
            this.updateCycleList();
            this.calculateTotalSelectedCycles();
            this.showToast('Success', `Sperm bank ${this.isEditingSperm ? 'updated' : 'added'} successfully.`, 'success');
        } catch (error) {
            console.error('Error in handleAddNewSpermBankClick:', error);
            this.showToast('Error', `Error ${this.isEditingSperm ? 'updating' : 'adding'} sperm bank: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleCancelSperm() {
        this.showSpermForm = false;
        this.showSpermPicker = false;
        this.isEditingSperm = false;
        this.deleteItemIndex = -1;
        this.newSperm = {
            id: '',
            spermBankName: '',
            spermBankPhone: '',
            coordinatorName: '',
            coordinatorId: '',
            spermBankWebsite: '',
            spermBankEmail: '',
            accountId: '',
            disableInputs: false,
            disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false,
            isAdditionalCoordinators: false,
            coordinatorUserInputsObj: {
                firstName: '',
                lastName: '',
                phone: '',
                coordinatorId: '',
                parentId: '',
                fullName: '',
                isAllow: false,
                isCoordinatorFirstNameBlank: false
            },
            disableAddCoordinatorIcon: true,
            cycles: []
        };
    }

    handleAddClinicClick() {
        this.showClinicPicker = true;
        this.showClinicForm = false;
        this.isEditingClinic = false;
        this.deleteItemIndex = -1;
        this.newClinic = {
            id: `clinic_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            clinicName: '',
            phone: '',
            coordinatorName: '',
            coordinatorId: '',
            website: '',
            cityState: '',
            coordinatorEmail: '',
            accountId: '',
            disableInputs: false,
            disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false,
            isAdditionalCoordinators: false,
            coordinatorUserInputsObj: {
                firstName: '',
                lastName: '',
                phone: '',
                coordinatorId: '',
                parentId: '',
                fullName: '',
                isAllow: false,
                isCoordinatorFirstNameBlank: false
            },
            disableAddCoordinatorIcon: true,
            cycles: []
        };
        this.noClinicChecked = false;
        this.showClinicPlusButton = false;
    }

    handlePlusClinicClick() {
        this.showClinicPicker = false;
        this.showClinicForm = true;
        this.newClinic.disableInputs = false;
        this.newClinic.disableAddIcon = false;
        this.showClinicPlusButton = true;
    }

    async handleAddNewClinicClick() {
        if (!this.newClinic.clinicName) {
            this.showToast('Error', 'Clinic Name is required.', 'error');
            return;
        }
        if (this.showCycleCheckboxes && this.newClinic.cycles.length === 0) {
            this.showToast('Error', 'At least one donation cycle must be selected.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            let clinicId;
            if (this.newClinic.accountId && !this.isEditingClinic) {
                clinicId = await addlookupClinic({
                    donorId: this.donorId,
                    clinicId: this.newClinic.accountId,
                    coordinatorId: this.newClinic.coordinatorId,
                    coordinatorFirstName: this.newClinic.coordinatorUserInputsObj.firstName,
                    coordinatorLastName: this.newClinic.coordinatorUserInputsObj.lastName,
                    coordinatorPhone: this.newClinic.coordinatorUserInputsObj.phone,
                    coordinatorName: this.newClinic.coordinatorName,
                    cycles: this.newClinic.cycles
                });
            } else {
                const apexMethod = this.isEditingClinic ? editClinic : addClinic;
                clinicId = await apexMethod({
                    donorId: this.donorId,
                    clinicId: this.newClinic.id,
                    clinicName: this.newClinic.clinicName,
                    phone: this.newClinic.phone,
                    coordinatorName: this.newClinic.coordinatorName,
                    coordinatorId: this.newClinic.coordinatorId,
                    website: this.newClinic.website,
                    cityState: this.newClinic.cityState,
                    email: this.newClinic.coordinatorEmail,
                    cycles: this.newClinic.cycles
                });
            }
            const newClinic = {
                ...this.newClinic,
                id: clinicId || this.newClinic.id,
                isEditable: true,
                isFromPrimaryBanks: !!this.newClinic.accountId
            };
            if (this.isEditingClinic) {
                this.clinics = this.clinics.map((clinic, index) =>
                    index === this.deleteItemIndex ? newClinic : clinic
                );
            } else {
                this.clinics = [...this.clinics, newClinic];
            }
            this.showClinicForm = false;
            this.showClinicPicker = false;
            this.isEditingClinic = false;
            this.deleteItemIndex = -1;
            this.updateCycleList();
            this.calculateTotalSelectedCycles();
            this.showToast('Success', `Clinic ${this.isEditingClinic ? 'updated' : 'added'} successfully.`, 'success');
        } catch (error) {
            console.error('Error in handleAddNewClinicClick:', error);
            this.showToast('Error', `Error ${this.isEditingClinic ? 'updating' : 'adding'} clinic: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleCancelClinic() {
        this.showClinicForm = false;
        this.showClinicPicker = false;
        this.isEditingClinic = false;
        this.deleteItemIndex = -1;
        this.newClinic = {
            id: '',
            clinicName: '',
            phone: '',
            coordinatorName: '',
            coordinatorId: '',
            website: '',
            cityState: '',
            coordinatorEmail: '',
            accountId: '',
            disableInputs: false,
            disableAddIcon: true,
            showNoCoordinatorRecordsErrorMessage: false,
            isAdditionalCoordinators: false,
            coordinatorUserInputsObj: {
                firstName: '',
                lastName: '',
                phone: '',
                coordinatorId: '',
                parentId: '',
                fullName: '',
                isAllow: false,
                isCoordinatorFirstNameBlank: false
            },
            disableAddCoordinatorIcon: true,
            cycles: []
        };
    }

    handleAddAttorneyClick() {
        this.showAttorneyForm = true;
        this.isEditingAttorney = false;
        this.deleteItemIndex = -1;
        this.newAttorney = {
            id: `attorney_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            attorneyName: '',
            phone: '',
            lawFirm: '',
            website: '',
            cityState: '',
            email: '',
            disableInputs: false,
            cycles: []
        };
    }

    async handleAddNewAttorneyClick() {
        if (!this.newAttorney.attorneyName) {
            this.showToast('Error', 'Attorney Name is required.', 'error');
            return;
        }
        if (this.showCycleCheckboxes && this.newAttorney.cycles.length === 0) {
            this.showToast('Error', 'At least one donation cycle must be selected.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            const apexMethod = this.isEditingAttorney ? editAttorney : addAttorney;
            const attorneyId = await apexMethod({
                donorId: this.donorId,
                attorneyId: this.newAttorney.id,
                attorneyName: this.newAttorney.attorneyName,
                phone: this.newAttorney.phone,
                lawFirm: this.newAttorney.lawFirm,
                website: this.newAttorney.website,
                cityState: this.newAttorney.cityState,
                email: this.newAttorney.email,
                cycles: this.newAttorney.cycles
            });
            const newAttorney = {
                ...this.newAttorney,
                id: attorneyId || this.newAttorney.id,
                isEditable: true
            };
            if (this.isEditingAttorney) {
                this.attorneys = this.attorneys.map((attorney, index) =>
                    index === this.deleteItemIndex ? newAttorney : attorney
                );
            } else {
                this.attorneys = [...this.attorneys, newAttorney];
            }
            this.showAttorneyForm = false;
            this.isEditingAttorney = false;
            this.deleteItemIndex = -1;
            this.updateCycleList();
            this.calculateTotalSelectedCycles();
            this.showToast('Success', `Attorney ${this.isEditingAttorney ? 'updated' : 'added'} successfully.`, 'success');
        } catch (error) {
            console.error('Error in handleAddNewAttorneyClick:', error);
            this.showToast('Error', `Error ${this.isEditingAttorney ? 'updating' : 'adding'} attorney: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleCancelAttorney() {
        this.showAttorneyForm = false;
        this.isEditingAttorney = false;
        this.deleteItemIndex = -1;
        this.newAttorney = {
            id: '',
            attorneyName: '',
            phone: '',
            lawFirm: '',
            website: '',
            cityState: '',
            email: '',
            disableInputs: false,
            cycles: []
        };
    }

    handleAddRecipientClick() {
        this.showRecipientForm = true;
        this.isEditingRecipient = false;
        this.deleteItemIndex = -1;
        this.newRecipient = {
            id: `recipient_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            firstName: '',
            lastName: '',
            Name: '',
            phone: '',
            email: '',
            additionalInfo: '',
            disableInputs: false,
            cycles: []
        };
    }

    async handleAddNewRecipientClick() {
        if (!this.newRecipient.lastName) {
            this.showToast('Error', 'Recipient Last Name is required.', 'error');
            return;
        }
        if (this.showCycleCheckboxes && this.newRecipient.cycles.length === 0) {
            this.showToast('Error', 'At least one donation cycle must be selected.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            const apexMethod = this.isEditingRecipient ? editRecipient : addRecipient;
            const recipientId = await apexMethod({
                donorId: this.donorId,
                recipientId: this.newRecipient.id,
                firstName: this.newRecipient.firstName,
                lastName: this.newRecipient.lastName,
                phone: this.newRecipient.phone,
                email: this.newRecipient.email,
                additionalInfo: this.newRecipient.additionalInfo,
                cycles: this.newRecipient.cycles
            });
            const newRecipient = {
                ...this.newRecipient,
                id: recipientId || this.newRecipient.id,
                Name: `${this.newRecipient.firstName || ''} ${this.newRecipient.lastName || ''}`.trim(),
                isEditable: true
            };
            if (this.isEditingRecipient) {
                this.recipients = this.recipients.map((recipient, index) =>
                    index === this.deleteItemIndex ? newRecipient : recipient
                );
            } else {
                this.recipients = [...this.recipients, newRecipient];
            }
            this.showRecipientForm = false;
            this.isEditingRecipient = false;
            this.deleteItemIndex = -1;
            this.updateCycleList();
            this.calculateTotalSelectedCycles();
            this.showToast('Success', `Recipient ${this.isEditingRecipient ? 'updated' : 'added'} successfully.`, 'success');
        } catch (error) {
            console.error('Error in handleAddNewRecipientClick:', error);
            this.showToast('Error', `Error ${this.isEditingRecipient ? 'updating' : 'adding'} recipient: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    handleCancelRecipient() {
        this.showRecipientForm = false;
        this.isEditingRecipient = false;
        this.deleteItemIndex = -1;
        this.newRecipient = {
            id: '',
            firstName: '',
            lastName: '',
            Name: '',
            phone: '',
            email: '',
            additionalInfo: '',
            disableInputs: false,
            cycles: []
        };
    }

    handleEditAgency(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.isEditingAgency = true;
        this.deleteItemIndex = index;
        this.newAgency = { ...this.agencies[index], disableInputs: !this.agencies[index].isEditable };
        this.showAgencyForm = true;
        this.showAgencyPicker = false;
        this.showAgencyPlusButton = true;
    }

    handleEditSperm(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.isEditingSperm = true;
        this.deleteItemIndex = index;
        this.newSperm = { ...this.sperms[index], disableInputs: !this.sperms[index].isEditable };
        this.showSpermForm = true;
        this.showSpermPicker = false;
        this.showPlusButton = true;
    }

    handleEditClinic(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.isEditingClinic = true;
        this.deleteItemIndex = index;
        this.newClinic = { ...this.clinics[index], disableInputs: !this.clinics[index].isEditable };
        this.showClinicForm = true;
        this.showClinicPicker = false;
        this.showClinicPlusButton = true;
    }

    handleEditAttorney(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.isEditingAttorney = true;
        this.deleteItemIndex = index;
        this.newAttorney = { ...this.attorneys[index] };
        this.showAttorneyForm = true;
    }

    handleEditRecipient(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.isEditingRecipient = true;
        this.deleteItemIndex = index;
        this.newRecipient = { ...this.recipients[index] };
        this.showRecipientForm = true;
    }

    handleDeleteAgency(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.deleteItemType = 'Agency';
        this.deleteItemIndex = index;
        this.deleteItemName = this.agencies[index].agencyName;
        this.deleteItemId = this.agencies[index].id;
        this.showDeletePopup = true;
    }

    handleDeleteSperm(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.deleteItemType = 'Sperm Bank';
        this.deleteItemIndex = index;
        this.deleteItemName = this.sperms[index].spermBankName;
        this.deleteItemId = this.sperms[index].id;
        this.showDeletePopup = true;
    }

    handleDeleteClinic(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.deleteItemType = 'Clinic';
        this.deleteItemIndex = index;
        this.deleteItemName = this.clinics[index].clinicName;
        this.deleteItemId = this.clinics[index].id;
        this.showDeletePopup = true;
    }

    handleDeleteAttorney(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.deleteItemType = 'Attorney';
        this.deleteItemIndex = index;
        this.deleteItemName = this.attorneys[index].attorneyName;
        this.deleteItemId = this.attorneys[index].id;
        this.showDeletePopup = true;
    }

    handleDeleteRecipient(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.deleteItemType = 'Recipient';
        this.deleteItemIndex = index;
        this.deleteItemName = this.recipients[index].Name;
        this.deleteItemId = this.recipients[index].id;
        this.showDeletePopup = true;
    }

    async handleDeleteYes() {
        try {
            this.loadSpinner = true;
            switch (this.deleteItemType) {
                case 'Agency':
                    await deleteAgency({ donorId: this.donorId, agencyId: this.deleteItemId });
                    this.agencies = this.agencies.filter((_, index) => index !== this.deleteItemIndex);
                    break;
                case 'Sperm Bank':
                    await deleteSpermBank({ donorId: this.donorId, spermBankId: this.deleteItemId });
                    this.sperms = this.sperms.filter((_, index) => index !== this.deleteItemIndex);
                    break;
                case 'Clinic':
                    await deleteClinic({ donorId: this.donorId, clinicId: this.deleteItemId });
                    this.clinics = this.clinics.filter((_, index) => index !== this.deleteItemIndex);
                    break;
                case 'Attorney':
                    await deleteAttorney({ donorId: this.donorId, attorneyId: this.deleteItemId });
                    this.attorneys = this.attorneys.filter((_, index) => index !== this.deleteItemIndex);
                    break;
                case 'Recipient':
                    await deleteRecipient({ donorId: this.donorId, recipientId: this.deleteItemId });
                    this.recipients = this.recipients.filter((_, index) => index !== this.deleteItemIndex);
                    break;
                default:
                    throw new Error('Invalid item type for deletion');
            }
            this.updateCycleList();
            this.calculateTotalSelectedCycles();
            this.showToast('Success', `${this.deleteItemType} deleted successfully.`, 'success');
        } catch (error) {
            console.error(`Error deleting ${this.deleteItemType}:`, error);
            this.showToast('Error', `Error deleting ${this.deleteItemType}: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.showDeletePopup = false;
            this.deleteItemType = '';
            this.deleteItemIndex = -1;
            this.deleteItemName = '';
            this.deleteItemId = '';
            this.loadSpinner = false;
        }
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteItemType = '';
        this.deleteItemIndex = -1;
        this.deleteItemName = '';
        this.deleteItemId = '';
    }

    handleMissedCycleYesClick(event) {
        const cycleId = event.target.dataset.cycleId;
        this.unselectedCycles = this.unselectedCycles.filter(cycle => cycle.id !== cycleId);
        this.showMissedCycles = false;
        this.showAgencyPicker = true;
    }

    handleMissedCycleNoClick(event) {
        const cycleId = event.target.dataset.cycleId;
        this.unselectedCycles = this.unselectedCycles.filter(cycle => cycle.id !== cycleId);
    }

    handleBackFromMissedPopup() {
        this.showMissedCycles = false;
        this.unselectedCycles = [];
        this.dispatchEvent(new CustomEvent('donorhippaback'));
    }

    handleNextFromMissedPopup() {
        this.showMissedCycles = false;
        this.saveAndProceed();
    }

    handleConfirmationChange(event) {
        this.isConfirmed = event.target.checked;
    }

    async handleDonorHippaNext() {
        if (!this.validateForm()) return;
        if (this.showCycleCheckboxes && this.totalSelectedCycles < this.totalDonationsCount) {
            this.unselectedCycles = this.cycleList.filter(cycle => !this.isCycleSelected(cycle.cycleNumber));
            if (this.unselectedCycles.length > 0) {
                this.showMissedCycles = true;
                return;
            }
        }
        this.saveAndProceed();
    }

    handleDonorHippaBack() {
        this.dispatchEvent(new CustomEvent('donorhippaback'));
    }

    isCycleSelected(cycleNumber) {
        return [
            ...this.agencies.flatMap(agency => agency.cycles),
            ...this.clinics.flatMap(clinic => clinic.cycles),
            ...this.attorneys.flatMap(attorney => attorney.cycles),
            ...this.recipients.flatMap(recipient => recipient.cycles)
        ].includes(cycleNumber);
    }

    async saveAndProceed() {
        try {
            this.loadSpinner = true;
            await updateDonorName({
                donorId: this.donorId,
                firstName: this.legalName.firstName,
                lastName: this.legalName.lastName,
                dob: this.dob,
                state: this.address.state,
                city: this.address.city,
                street: this.address.street,
                pincode: this.address.pincode,
                additionalInfo: this.address.additionalInfo
            });
            this.dispatchEvent(new CustomEvent('donorhippanext', {
                detail: {
                    donorId: this.donorId,
                    legalName: this.legalName,
                    dob: this.dob,
                    address: this.address,
                    agencies: this.agencies,
                    sperms: this.sperms,
                    clinics: this.clinics,
                    attorneys: this.attorneys,
                    recipients: this.recipients
                }
            }));
            this.showToast('Success', 'Information saved successfully.', 'success');
        } catch (error) {
            console.error('Error in saveAndProceed:', error);
            this.showToast('Error', `Error saving information: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    validateForm() {
        let isValid = true;
        const inputs = this.template.querySelectorAll('.validateInputCls');
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });
        if (!this.dob || this.dobError) {
            this.dobError = this.dobError || 'Date of Birth is required.';
            this.showToast('Error', 'Date of Birth is required.', 'error');
            isValid = false;
        }
        if (!this.address.state) {
            this.showToast('Error', 'State is required.', 'error');
            isValid = false;
        }
        if (!this.address.city) {
            this.showToast('Error', 'City is required.', 'error');
            isValid = false;
        }
        if (!this.isConfirmed) {
            this.showToast('Error', 'Please confirm that the information is accurate.', 'error');
            isValid = false;
        }
        return isValid;
    }

    validateDob(dob) {
        if (!dob) return false;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}