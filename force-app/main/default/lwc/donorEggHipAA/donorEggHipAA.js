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
import fetchSpermBankRecord from '@salesforce/apex/UtilityClass.fetchSpermBankRecord';
import addlookupSpermBank from '@salesforce/apex/DonorPreRegHippaController2222.addlookupSpermBank';
import addlookupClinic from '@salesforce/apex/DonorPreRegHippaController2222.addlookupClinic';
//import addlookupAgency from '@salesforce/apex/DonorPreRegHippaController2222.addlookupAgency';
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
        disableAddCoordinatorIcon: true
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
    @track selectedSpermBank = null;
    @track showAddButton = false;
    @track showPlusButton = false;
    @track showClinicAddButton = false;
    @track showClinicPlusButton = false;
    @track selectedClinicId = '';
    @track selectedClinic = null;
    @track selectedAgencyId = '';
    @track selectedAgency = null;
    @track loadSpinner = false;

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
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj || {}));
            this.donorId = this.contactObj.donorId || '003QL00000xXfiNYAS';
            this.showagencySection = this.contactObj.donorType === 'egg';
            this.showSpermBankSection = this.contactObj.donorType !== 'egg';
            this.showclinicSection = true;
            this.showattorneySection = this.contactObj.donorType === 'egg';
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

            this.totalDonationsCount = this.contactObj.donationBasics?.egg?.liveBirths || 0;
            this.initializeCycles();

            const result = await spermDonor({ donorId: this.donorId });
            console.log('spermDonor result:', JSON.stringify(result));

            if (result.parentdetails) {
                this.legalNamesri = {
                    firstName: result.parentdetails.fristName || this.legalNamesri.firstName,
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
                pmcNumber: item.pmcNumber || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false,
                accountId: item.AccountId || '',
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: item.coordinatorFirstName || '',
                    lastName: item.coordinatorLastName || '',
                    phone: item.coordinatorPhone || '',
                    coordinatorId: item.coordinatorId || '',
                    parentId: item.AccountId || '',
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
                pmcNumber: item.pmcNumber || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false,
                accountId: item.AccountId || '',
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: item.coordinatorFirstName || '',
                    lastName: item.coordinatorLastName || '',
                    phone: item.coordinatorPhone || '',
                    coordinatorId: item.coordinatorId || '',
                    parentId: item.AccountId || '',
                    fullName: item.coordinatorName || '',
                    isAllow: !!item.coordinatorId,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: !!item.coordinatorId
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
                pmcNumber: item.pmcNumber || '',
                isEditable: item.isEditable !== false,
                isFromPrimaryBanks: item.isEditable === false,
                accountId: item.AccountId || '',
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: item.coordinatorFirstName || '',
                    lastName: item.coordinatorLastName || '',
                    phone: item.coordinatorPhone || '',
                    coordinatorId: item.coordinatorId || '',
                    parentId: item.AccountId || '',
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
                isFromPrimaryBanks: false,
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
                isFromPrimaryBanks: false,
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
                cycleNumber: index + 1,
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
            disabled: allSelectedCycles.includes(cycle.id)
        }));
    }

    calculateTotalSelectedCycles() {
        this.totalSelectedCycles = [
            ...this.agencies.flatMap(agency => agency.cycles),
            ...this.clinics.flatMap(clinic => clinic.cycles),
            ...this.attorneys.flatMap(attorney => attorney.cycles),
            ...this.recipients.flatMap(recipient => recipient.cycles)
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
        const cycleId = event.target.value;
        const isChecked = event.target.checked;
        const dataType = event.target.dataset.type;
        const entity = this.getEntity(dataType);

        if (isChecked) {
            if (!entity.cycles.includes(cycleId)) {
                entity.cycles = [...entity.cycles, cycleId];
                this.totalSelectedCycles++;
            }
        } else {
            entity.cycles = entity.cycles.filter(id => id !== cycleId);
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

    handleAgencySelect(event) {
        try {
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
                this.showAgencyPicker = false;
                this.showAgencyForm = true;
            }
        } catch (error) {
            console.error('Error in handleAgencySelect:', error);
            this.showToast('Error', `Error selecting agency: ${error.body?.message || error.message}`, 'error');
        }
    }

    handleNoAgencyData(event) {
        this.noAgencyChecked = true;
        this.newAgency.disableAddIcon = false;
        this.showToast('Info', 'No agency found. Click the add icon to add a new agency manually.', 'info');
    }

    async handleSpermBankSelect(event) {
        try {
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
                disableAddCoordinatorIcon: true
            };
            this.noSpermChecked = !id;
            if (id) {
                this.loadSpinner = true;
                const spermBankDetails = await fetchSpermBankRecord({ spermBankId: id });
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
                        isAllow: !!spermBankDetails.coordinatorId,
                        isCoordinatorFirstNameBlank: false
                    },
                    disableAddCoordinatorIcon: !!spermBankDetails.coordinatorId
                };
                this.showSpermPicker = false;
                this.showSpermForm = true;
                this.showToast('Success', 'Sperm bank details loaded successfully.', 'success');
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
        this.showToast('Info', 'No sperm bank found. Click the add icon to add a new sperm bank manually.', 'info');
    }

    handleClinicSelect(event) {
        try {
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
                this.showClinicPicker = false;
                this.showClinicForm = true;
            }
        } catch (error) {
            console.error('Error in handleClinicSelect:', error);
            this.showToast('Error', `Error selecting clinic: ${error.body?.message || error.message}`, 'error');
        }
    }

    handleNoClinicData(event) {
        this.noClinicChecked = true;
        this.newClinic.disableAddIcon = false;
        this.showToast('Info', 'No clinic found. Click the add icon to add a new clinic manually.', 'info');
    }

    handleCoordinatorSelect(event) {
        try {
            const { id, name, dataType } = event.detail;
            const entity = this.getEntity(dataType);
            entity.coordinatorId = id || '';
            entity.coordinatorName = name || '';
            entity.coordinatorUserInputsObj = {
                firstName: '',
                lastName: '',
                phone: '',
                coordinatorId: id || '',
                parentId: entity.accountId,
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
            firstName: '',
            lastName: '',
            phone: '',
            coordinatorId: '',
            parentId: entity.accountId,
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
        entity.coordinatorName = `${entity.coordinatorUserInputsObj.firstName} ${entity.coordinatorUserInputsObj.lastName}`.trim();
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
            entity.coordinatorUserInputsObj.coordinatorId = coordinatorId;
            entity.coordinatorUserInputsObj.fullName = entity.coordinatorName;
            entity.coordinatorUserInputsObj.isAllow = true;
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
    }

    handleAddSpermClick() {
        this.showSpermPicker = true;
        this.showSpermForm = false;
        this.isEditingSperm = false;
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
            disableAddCoordinatorIcon: true
        };
        this.noSpermChecked = false;
    }

    handleAddClinicClick() {
        this.showClinicPicker = true;
        this.showClinicForm = false;
        this.isEditingClinic = false;
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
    }

    handleAddAttorneyClick() {
        this.showAttorneyForm = true;
        this.isEditingAttorney = false;
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

    handleAddRecipientClick() {
        this.showRecipientForm = true;
        this.isEditingRecipient = false;
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

    async handlePlusAgencyClick() {
        try {
            this.loadSpinner = true;
            const accountId = await addlookupAgency({ donorId: this.donorId });
            this.newAgency = {
                ...this.newAgency,
                accountId: accountId,
                agencyName: '',
                phone: '',
                coordinatorName: '',
                coordinatorId: '',
                website: '',
                cityState: '',
                coordinatorEmail: '',
                disableInputs: false,
                disableAddIcon: true,
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: '',
                    lastName: '',
                    phone: '',
                    coordinatorId: '',
                    parentId: accountId,
                    fullName: '',
                    isAllow: false,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: true,
                cycles: []
            };
            this.showAgencyForm = true;
            this.showAgencyPicker = false;
            this.noAgencyChecked = false;
            this.showToast('Success', 'New agency record created. Please fill in the details.', 'success');
        } catch (error) {
            console.error('Error in handlePlusAgencyClick:', error);
            this.showToast('Error', `Error creating new agency: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    async handlePlusIconClick() {
        try {
            this.loadSpinner = true;
            const accountId = await addlookupSpermBank({ donorId: this.donorId });
            this.newSperm = {
                ...this.newSperm,
                accountId: accountId,
                spermBankName: '',
                spermBankPhone: '',
                coordinatorName: '',
                coordinatorId: '',
                spermBankWebsite: '',
                spermBankEmail: '',
                disableInputs: false,
                disableAddIcon: true,
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: '',
                    lastName: '',
                    phone: '',
                    coordinatorId: '',
                    parentId: accountId,
                    fullName: '',
                    isAllow: false,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: true
            };
            this.showSpermForm = true;
            this.showSpermPicker = false;
            this.noSpermChecked = false;
            this.showToast('Success', 'New sperm bank record created. Please fill in the details.', 'success');
        } catch (error) {
            console.error('Error in handlePlusIconClick:', error);
            this.showToast('Error', `Error creating new sperm bank: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
    }

    async handlePlusClinicClick() {
        try {
            this.loadSpinner = true;
            const accountId = await addlookupClinic({ donorId: this.donorId });
            this.newClinic = {
                ...this.newClinic,
                accountId: accountId,
                clinicName: '',
                phone: '',
                coordinatorName: '',
                coordinatorId: '',
                website: '',
                cityState: '',
                coordinatorEmail: '',
                disableInputs: false,
                disableAddIcon: true,
                showNoCoordinatorRecordsErrorMessage: false,
                isAdditionalCoordinators: false,
                coordinatorUserInputsObj: {
                    firstName: '',
                    lastName: '',
                    phone: '',
                    coordinatorId: '',
                    parentId: accountId,
                    fullName: '',
                    isAllow: false,
                    isCoordinatorFirstNameBlank: false
                },
                disableAddCoordinatorIcon: true,
                cycles: []
            };
            this.showClinicForm = true;
            this.showClinicPicker = false;
            this.noClinicChecked = false;
            this.showToast('Success', 'New clinic record created. Please fill in the details.', 'success');
        } catch (error) {
            console.error('Error in handlePlusClinicClick:', error);
            this.showToast('Error', `Error creating new clinic: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
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
            let agencyId = this.newAgency.id;
            if (this.isEditingAgency) {
                await editAgency({
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
                this.agencies = this.agencies.map(agency =>
                    agency.id === this.newAgency.id ? { ...this.newAgency, isFromPrimaryBanks: false } : agency
                );
            } else {
                agencyId = await addAgency({
                    donorId: this.donorId,
                    agencyName: this.newAgency.agencyName,
                    phone: this.newAgency.phone,
                    coordinatorName: this.newAgency.coordinatorName,
                    coordinatorId: this.newAgency.coordinatorId,
                    website: this.newAgency.website,
                    cityState: this.newAgency.cityState,
                    email: this.newAgency.coordinatorEmail,
                    cycles: this.newAgency.cycles
                });
                this.agencies.push({ ...this.newAgency, id: agencyId, isFromPrimaryBanks: false });
            }
            this.showAgencyForm = false;
            this.showAgencyPicker = false;
            this.isEditingAgency = false;
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

    async handleAddNewSpermBankClick() {
        if (!this.newSperm.spermBankName) {
            this.showToast('Error', 'Sperm Bank Name is required.', 'error');
            return;
        }
        try {
            this.loadSpinner = true;
            let spermBankId = this.newSperm.id;
            if (this.isEditingSperm) {
                await editSpermBank({
                    donorId: this.donorId,
                    spermBankId: this.newSperm.id,
                    spermBankName: this.newSperm.spermBankName,
                    phone: this.newSperm.spermBankPhone,
                    coordinatorName: this.newSperm.coordinatorName,
                    coordinatorId: this.newSperm.coordinatorId,
                    website: this.newSperm.spermBankWebsite,
                    email: this.newSperm.spermBankEmail
                });
                this.sperms = this.sperms.map(sperm =>
                    sperm.id === this.newSperm.id ? { ...this.newSperm, isFromPrimaryBanks: false } : sperm
                );
            } else {
                spermBankId = await addSpermBank({
                    donorId: this.donorId,
                    spermBankName: this.newSperm.spermBankName,
                    phone: this.newSperm.spermBankPhone,
                    coordinatorName: this.newSperm.coordinatorName,
                    coordinatorId: this.newSperm.coordinatorId,
                    website: this.newSperm.spermBankWebsite,
                    email: this.newSperm.spermBankEmail
                });
                this.sperms.push({ ...this.newSperm, id: spermBankId, isFromPrimaryBanks: false });
            }
            this.showSpermForm = false;
            this.showSpermPicker = false;
            this.isEditingSperm = false;
            this.showToast('Success', `Sperm bank ${this.isEditingSperm ? 'updated' : 'added'} successfully.`, 'success');
        } catch (error) {
            console.error('Error in handleAddNewSpermBankClick:', error);
            this.showToast('Error', `Error ${this.isEditingSperm ? 'updating' : 'adding'} sperm bank: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.loadSpinner = false;
        }
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
            let clinicId = this.newClinic.id;
            if (this.isEditingClinic) {
                await editClinic({
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
                this.clinics = this.clinics.map(clinic =>
                    clinic.id === this.newClinic.id ? { ...this.newClinic, isFromPrimaryBanks: false } : clinic
                );
            } else {
                clinicId = await addClinic({
                    donorId: this.donorId,
                    clinicName: this.newClinic.clinicName,
                    phone: this.newClinic.phone,
                    coordinatorName: this.newClinic.coordinatorName,
                    coordinatorId: this.newClinic.coordinatorId,
                    website: this.newClinic.website,
                    cityState: this.newClinic.cityState,
                    email: this.newClinic.coordinatorEmail,
                    cycles: this.newClinic.cycles
                });
                this.clinics.push({ ...this.newClinic, id: clinicId, isFromPrimaryBanks: false });
            }
            this.showClinicForm = false;
            this.showClinicPicker = false;
            this.isEditingClinic = false;
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
            let attorneyId = this.newAttorney.id;
            if (this.isEditingAttorney) {
                await editAttorney({
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
                this.attorneys = this.attorneys.map(attorney =>
                    attorney.id === this.newAttorney.id ? { ...this.newAttorney } : attorney
                );
            } else {
                attorneyId = await addAttorney({
                    donorId: this.donorId,
                    attorneyName: this.newAttorney.attorneyName,
                    phone: this.newAttorney.phone,
                    lawFirm: this.newAttorney.lawFirm,
                    website: this.newAttorney.website,
                    cityState: this.newAttorney.cityState,
                    email: this.newAttorney.email,
                    cycles: this.newAttorney.cycles
                });
                this.attorneys.push({ ...this.newAttorney, id: attorneyId });
            }
            this.showAttorneyForm = false;
            this.isEditingAttorney = false;
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
            let recipientId = this.newRecipient.id;
            if (this.isEditingRecipient) {
                await editRecipient({
                    donorId: this.donorId,
                    recipientId: this.newRecipient.id,
                    firstName: this.newRecipient.firstName,
                    lastName: this.newRecipient.lastName,
                    phone: this.newRecipient.phone,
                    email: this.newRecipient.email,
                    additionalInfo: this.newRecipient.additionalInfo,
                    cycles: this.newRecipient.cycles
                });
                this.recipients = this.recipients.map(recipient =>
                    recipient.id === this.newRecipient.id ? { ...this.newRecipient, Name: `${this.newRecipient.firstName || ''} ${this.newRecipient.lastName || ''}`.trim() } : recipient
                );
            } else {
                recipientId = await addRecipient({
                    donorId: this.donorId,
                    firstName: this.newRecipient.firstName,
                    lastName: this.newRecipient.lastName,
                    phone: this.newRecipient.phone,
                    email: this.newRecipient.email,
                    additionalInfo: this.newRecipient.additionalInfo,
                    cycles: this.newRecipient.cycles
                });
                this.recipients.push({ ...this.newRecipient, id: recipientId, Name: `${this.newRecipient.firstName || ''} ${this.newRecipient.lastName || ''}`.trim() });
            }
            this.showRecipientForm = false;
            this.isEditingRecipient = false;
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

    handleEditAgency(event) {
        const index = event.target.dataset.index;
        this.isEditingAgency = true;
        this.newAgency = { ...this.agencies[index] };
        this.showAgencyForm = true;
        this.showAgencyPicker = false;
    }

    handleEditSperm(event) {
        const index = event.target.dataset.index;
        this.isEditingSperm = true;
        this.newSperm = { ...this.sperms[index] };
        this.showSpermForm = true;
        this.showSpermPicker = false;
    }

    handleEditClinic(event) {
        const index = event.target.dataset.index;
        this.isEditingClinic = true;
        this.newClinic = { ...this.clinics[index] };
        this.showClinicForm = true;
        this.showClinicPicker = false;
    }

    handleEditAttorney(event) {
        const index = event.target.dataset.index;
        this.isEditingAttorney = true;
        this.newAttorney = { ...this.attorneys[index] };
        this.showAttorneyForm = true;
    }

    handleEditRecipient(event) {
        const index = event.target.dataset.index;
        this.isEditingRecipient = true;
        this.newRecipient = { ...this.recipients[index] };
        this.showRecipientForm = true;
    }

    handleDeleteAgency(event) {
        this.deleteItemType = 'Agency';
        this.deleteItemIndex = event.target.dataset.index;
        this.deleteItemName = this.agencies[this.deleteItemIndex].agencyName;
        this.deleteItemId = this.agencies[this.deleteItemIndex].id;
        this.showDeletePopup = true;
    }

    handleDeleteSperm(event) {
        this.deleteItemType = 'Sperm Bank';
        this.deleteItemIndex = event.target.dataset.index;
        this.deleteItemName = this.sperms[this.deleteItemIndex].spermBankName;
        this.deleteItemId = this.sperms[this.deleteItemIndex].id;
        this.showDeletePopup = true;
    }

    handleDeleteClinic(event) {
        this.deleteItemType = 'Clinic';
        this.deleteItemIndex = event.target.dataset.index;
        this.deleteItemName = this.clinics[this.deleteItemIndex].clinicName;
        this.deleteItemId = this.clinics[this.deleteItemIndex].id;
        this.showDeletePopup = true;
    }

    handleDeleteAttorney(event) {
        this.deleteItemType = 'Attorney';
        this.deleteItemIndex = event.target.dataset.index;
        this.deleteItemName = this.attorneys[this.deleteItemIndex].attorneyName;
        this.deleteItemId = this.attorneys[this.deleteItemIndex].id;
        this.showDeletePopup = true;
    }

    handleDeleteRecipient(event) {
        this.deleteItemType = 'Recipient';
        this.deleteItemIndex = event.target.dataset.index;
        this.deleteItemName = this.recipients[this.deleteItemIndex].Name;
        this.deleteItemId = this.recipients[this.deleteItemIndex].id;
        this.showDeletePopup = true;
    }

    async handleDeleteYes() {
        try {
            this.loadSpinner = true;
            if (this.deleteItemType === 'Agency') {
                await deleteAgency({ donorId: this.donorId, agencyId: this.deleteItemId });
                this.agencies = this.agencies.filter((_, index) => index !== parseInt(this.deleteItemIndex));
            } else if (this.deleteItemType === 'Sperm Bank') {
                await deleteSpermBank({ donorId: this.donorId, spermBankId: this.deleteItemId });
                this.sperms = this.sperms.filter((_, index) => index !== parseInt(this.deleteItemIndex));
            } else if (this.deleteItemType === 'Clinic') {
                await deleteClinic({ donorId: this.donorId, clinicId: this.deleteItemId });
                this.clinics = this.clinics.filter((_, index) => index !== parseInt(this.deleteItemIndex));
            } else if (this.deleteItemType === 'Attorney') {
                await deleteAttorney({ donorId: this.donorId, attorneyId: this.deleteItemId });
                this.attorneys = this.attorneys.filter((_, index) => index !== parseInt(this.deleteItemIndex));
            } else if (this.deleteItemType === 'Recipient') {
                await deleteRecipient({ donorId: this.donorId, recipientId: this.deleteItemId });
                this.recipients = this.recipients.filter((_, index) => index !== parseInt(this.deleteItemIndex));
            }
            this.updateCycleList();
            this.calculateTotalSelectedCycles();
            this.showToast('Success', `${this.deleteItemType} deleted successfully.`, 'success');
        } catch (error) {
            console.error(`Error deleting ${this.deleteItemType}:`, error);
            this.showToast('Error', `Error deleting ${this.deleteItemType}: ${error.body?.message || error.message}`, 'error');
        } finally {
            this.showDeletePopup = false;
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

    handleCancelAgency() {
        this.showAgencyForm = false;
        this.showAgencyPicker = false;
        this.isEditingAgency = false;
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

    handleCancelSperm() {
        this.showSpermForm = false;
        this.showSpermPicker = false;
        this.isEditingSperm = false;
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
            disableAddCoordinatorIcon: true
        };
    }

    handleCancelClinic() {
        this.showClinicForm = false;
        this.showClinicPicker = false;
        this.isEditingClinic = false;
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

    handleCancelAttorney() {
        this.showAttorneyForm = false;
        this.isEditingAttorney = false;
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

    handleCancelRecipient() {
        this.showRecipientForm = false;
        this.isEditingRecipient = false;
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

    handleConfirmationChange(event) {
        this.isConfirmed = event.target.checked;
    }

    handleDonorHippaBack() {
        this.dispatchEvent(new CustomEvent('donorhippaback'));
    }

    handleDonorHippaNext() {
        if (!this.validateForm()) return;
        if (this.showCycleCheckboxes && this.totalSelectedCycles < this.totalDonationsCount) {
            this.unselectedCycles = this.cycleList.filter(cycle => !this.isCycleSelected(cycle.id));
            if (this.unselectedCycles.length > 0) {
                this.showMissedCycles = true;
                return;
            }
        }
        this.saveAndProceed();
    }

    isCycleSelected(cycleId) {
        return [
            ...this.agencies.flatMap(agency => agency.cycles),
            ...this.clinics.flatMap(clinic => clinic.cycles),
            ...this.attorneys.flatMap(attorney => attorney.cycles),
            ...this.recipients.flatMap(recipient => recipient.cycles)
        ].includes(cycleId);
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
    }

    handleNextFromMissedPopup() {
        this.showMissedCycles = false;
        this.saveAndProceed();
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
        const evt = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(evt);
    }
}