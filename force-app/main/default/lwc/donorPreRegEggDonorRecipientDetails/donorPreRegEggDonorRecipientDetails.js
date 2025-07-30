import { LightningElement, track, api } from 'lwc';
import WARNING_ICON_LOGO from '@salesforce/resourceUrl/warningIcon';
import deleteCycleAgency from '@salesforce/apex/EggDonorAgencyWithCodeController.deleteCycleAgency'


export default class RecipientDetails extends LightningElement {
    @track warningIcon = WARNING_ICON_LOGO;
    @track spermBanks = [];
    @track showNumberedHeadings = false;
    @track noSpermBankChecked = false;
    @track dontRememberChecked = false;
    @track totalDonationsCount;
    @track totalSelectedCycles = [];
    @track showDeletePopup = false;
    @track deleteIndex = null;
    @track deleteRecipientNumber = null;
    @track unselectedCycles = [];
    @track showMissedCycles = false;
    @track showMissedPopupBackButton = false;
    @track unselectedCyclesFilterList = [];
    @track notInterestedForRecipientCyclesList = [];
    @track showIntendedParentDetails = false;
    @track intendedParentDetails = '';
    @track intendedYesRadioDisabled = false;
    @track intendedNoRadioDisabled = false;
    @track intendedParentYesRadio = false;
    @track intendedParentNoRadio = false;
    @track clsNamestring = null;

    @api donationBasicsInfo;
    @api spermBankUserInput;
    @api contactObj;

    recipientDetailsObject = {
        id: 0,
        recipentNumber: 1,
        clinicHeading: 'Recipient Details',
        recipient1FirstName: '',
        recipient1LastName: '',
        phone: '',
        email: '',
        additionalInfo: '',
        cycles: [],
        selectedCycles: [],
        recipientId: '',
        contactId: '',
        junctionId: ''
    };

    get isHideAddAnotherRecipient(){
        return (this.noSpermBankChecked || !(this.spermBanks.length < this.totalDonationsCount));
    }

    connectedCallback() {
        try {
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj || {}));
            this.totalDonationsCount = this.contactObj.donationBasics.egg.liveBirths;
            if (this.contactObj && this.contactObj['recipientsWithoutCode'] && this.contactObj['recipientsWithoutCode'].length > 0) {
                this.spermBanks = this.contactObj.recipientsWithoutCode.map(outcome => ({
                    ...outcome,
                    cycles: outcome.cycles.map(cycle => ({ ...cycle }))
                }));
                this.totalSelectedCycles = [...new Set(this.spermBanks[0]?.totalSelectedCycles || [])];
                this.unselectedCycles = [...new Set(this.spermBanks[0]?.unselectedCycles?.filter(item => item && Object.keys(item).length > 0) || [])];
                this.noSpermBankChecked = this.spermBanks[0]?.noSpermBankChecked || false;
                this.dontRememberChecked = this.spermBanks[0]?.dontRememberChecked || false;
                this.intendedParentDetails = this.contactObj?.intendedParentDetails || '';
                if (this.intendedParentDetails) {
                    this.intendedParentNoRadio = false;
                    this.intendedParentYesRadio = true;
                    this.showIntendedParentDetails = true;
                }
                this.showNumberedHeadings = this.spermBanks.length > 1;
                if (this.noSpermBankChecked) {
                    this.intendedYesRadioDisabled = true;
                    this.intendedNoRadioDisabled = true;
                    this.clsNamestring = 'textcls addagencycls inputscls disableAddAnotherClickCls';
                    this.spermBanks = this.spermBanks.map(bank => ({
                        ...bank,
                        cycles: Array(this.totalDonationsCount)
                            .fill()
                            .map((_, index) => ({
                                index: index,
                                cycleId: `${index + 1}`,
                                cycleName: `Cycle ${index + 1}`,
                                disabled: true,
                                checked: false
                            }))
                    }));
                }
            } else {
                const cyclesList = Array(this.totalDonationsCount)
                    .fill()
                    .map((_, index) => ({
                        index: index,
                        cycleId: `${index + 1}`,
                        cycleName: `Cycle ${index + 1}`,
                        disabled: false,
                        checked: false
                    }));
                this.recipientDetailsObject.cycles = [...cyclesList];
                this.spermBanks = [{
                    ...this.recipientDetailsObject,
                    id: Date.now(),
                    recipentNumber: 1,
                    clinicHeading: 'Recipient Details'
                }];
            }
        } catch (e) {
            console.error('Error in connectedCallback:', e.message, e.stack);
        }
    }

    get noSpermBankOrDontRemember() {
        return this.noSpermBankChecked || this.dontRememberChecked;
    }

    get disableAddAnotherRecipient() {
        let clsName = 'textcls addagencycls inputscls';
        if (this.clsNamestring !== null) {
            clsName = this.clsNamestring;
        }
        if (this.totalSelectedCycles.length === this.totalDonationsCount || this.noSpermBankOrDontRemember) {
            clsName += ' disableAddAnotherClickCls';
        }
        return clsName;
    }

    get checkboxStatus() {
        return this.spermBanks.length > 1;
    }

    get showNextFromMissedPopupButton() {
        return this.notInterestedForRecipientCyclesList.length === this.unselectedCycles.length && this.unselectedCycles.length > 0;
    }

    handleNoSpermBankChange(event) {
        try {
            this.noSpermBankChecked = event.target.checked;
            this.dontRememberChecked = false;
            const cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
           

            if (this.noSpermBankChecked) {
                cycleCheckboxclsList.forEach(cycle => {
                    cycle.disabled = true;
                    cycle.checked = false;
                });
              
              
                this.intendedYesRadioDisabled = true;
                this.intendedNoRadioDisabled = true;
                this.clsNamestring = 'textcls addagencycls inputscls disableAddAnotherClickCls';
                this.spermBanks = this.spermBanks.map(bank => ({
                    ...bank,
                    recipient1FirstName: '',
                    recipient1LastName: '',
                    phone: '',
                    email: '',
                    additionalInfo: '',
                    cycles: Array(this.totalDonationsCount)
                        .fill()
                        .map((_, index) => ({
                            index: index,
                            cycleId: `${index + 1}`,
                            cycleName: `Cycle ${index + 1}`,
                            disabled: true,
                            checked: false
                        })),
                    selectedCycles: []
                }));
                this.totalSelectedCycles = [];
            } else {
                cycleCheckboxclsList.forEach(cycle => {
                    cycle.disabled = false;
                });
                this.intendedYesRadioDisabled = false;
                this.intendedNoRadioDisabled = false;
                this.clsNamestring = 'textcls addagencycls inputscls';
                this.spermBanks = this.spermBanks.map(bank => ({
                    ...bank,
                    cycles: Array(this.totalDonationsCount)
                        .fill()
                        .map((_, index) => ({
                            index: index,
                            cycleId: `${index + 1}`,
                            cycleName: `Cycle ${index + 1}`,
                            disabled: this.totalSelectedCycles.includes(index + 1),
                            checked: bank.cycles[index]?.checked || false
                        }))
                }));
            }
        } catch (e) {
            console.error('Error in handleNoSpermBankChange:', e.message, e.stack);
        }
    }

    handleDontRememberChange(event) {
        try {
            this.dontRememberChecked = event.target.checked;
            if (this.dontRememberChecked) {
                this.noSpermBankChecked = false;
                this.spermBanks = this.spermBanks.map(bank => ({
                    ...bank,
                    recipient1FirstName: '',
                    recipient1LastName: '',
                    phone: '',
                    email: '',
                    additionalInfo: '',
                    cycles: bank.cycles.map(cycle => ({
                        ...cycle,
                        checked: false,
                        disabled: false
                    })),
                    selectedCycles: []
                }));
                this.totalSelectedCycles = [];
                const cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
                cycleCheckboxclsList.forEach(cycle => {
                    cycle.disabled = false;
                });
            }
        } catch (e) {
            console.error('Error in handleDontRememberChange:', e.message, e.stack);
        }
    }

    handleInputChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            const field = event.target.name;
            this.spermBanks = this.spermBanks.map((bank, i) =>
                i === index ? { ...bank, [field]: event.target.value } : bank
            );
            const input = event.target;
            if (input.validity.valid) {
                input.setCustomValidity('');
                input.reportValidity();
            }
        } catch (e) {
            console.error('Error in handleInputChange:', e.message, e.stack);
        }
    }

    handleInputBlur(event) {
        try {
            const input = event.target;
            const fieldName = event.target.name;
            const value = input.value;
            const fieldsMap = new Map([
                ['recipient1FirstName', 'Please enter Recipient first name'],
                ['recipient1LastName', 'Please enter Recipient last name'],
                ['email', 'Please enter recipient email'],
                ['phone', 'Please enter recipient phone']
            ]);

            if (fieldsMap.has(fieldName) && !this.noSpermBankOrDontRemember && value === '') {
                input.setCustomValidity(fieldsMap.get(fieldName));
                input.reportValidity();
            } else {
                input.setCustomValidity('');
                input.reportValidity();
            }
        } catch (e) {
            console.error('Error in handleInputBlur:', e.message, e.stack);
        }
    }

    handleIntendedParentChange(event) {
        try {
            this.showIntendedParentDetails = event.target.value === 'yes';
            if (event.target.value === 'yes') {
                this.intendedParentNoRadio = false;
                this.intendedParentYesRadio = true;
            } else {
                this.intendedParentNoRadio = true;
                this.intendedParentYesRadio = false;
                this.intendedParentDetails = '';
            }
        } catch (e) {
            console.error('Error in handleIntendedParentChange:', e.message, e.stack);
        }
    }

    handleIntendedParentDetailsChange(event) {
        try {
            this.intendedParentDetails = event.target.value;
        } catch (e) {
            console.error('Error in handleIntendedParentDetailsChange:', e.message, e.stack);
        }
    }

    handleCycleChange(event) {
        try {
            const outcomeIndex = parseInt(event.target.dataset.outcomeindex, 10);
            const cycleIndex = parseInt(event.target.dataset.cycleindex, 10);
            let spermBanksList = this.spermBanks.map(bank => ({
                ...bank,
                cycles: bank.cycles.map(cycle => ({ ...cycle }))
            }));

            for (let i = 0; i < spermBanksList.length; i++) {
                if (event.target.checked) {
                    if (i !== outcomeIndex) {
                        spermBanksList[i].cycles[cycleIndex].checked = false;
                        spermBanksList[i].cycles[cycleIndex].disabled = true;
                    }
                    if (i === outcomeIndex) {
                        spermBanksList[outcomeIndex].cycles[cycleIndex].checked = true;
                    }
                } else {
                    if (i !== outcomeIndex) {
                        spermBanksList[i].cycles[cycleIndex].disabled = false;
                    }
                    if (i === outcomeIndex) {
                        spermBanksList[outcomeIndex].cycles[cycleIndex].checked = false;
                    }
                }
            }
             // Now update selectedCycles for each outcome
             spermBanksList = spermBanksList.map(outcome => ({
            ...outcome,
            selectedCycles: outcome.cycles
                .filter(cycle => cycle.checked)
                .map(cycle => cycle.cycleId)
        }));
            this.spermBanks = [...spermBanksList];
            if (event.target.checked) {
                if (!this.totalSelectedCycles.includes(parseInt(cycleIndex) + 1)) {
                    this.totalSelectedCycles.push(parseInt(cycleIndex) + 1);
                }
            } else {
                this.totalSelectedCycles = this.totalSelectedCycles.filter(
                    selectedCycle => selectedCycle !== (parseInt(cycleIndex) + 1)
                );
            }
        } catch (e) {
            console.error('Error in handleCycleChange:', e.message, e.stack);
        }
    }

    handleAddAnotherClick() {
        try {
            if (this.spermBanks.length < this.totalDonationsCount) {
                this.showNumberedHeadings = true;
                const newCyclesList = Array(this.totalDonationsCount)
                    .fill()
                    .map((_, index) => ({
                        index: index,
                        cycleId: `${index + 1}`,
                        cycleName: `Cycle ${index + 1}`,
                        disabled: this.totalSelectedCycles.includes(index + 1),
                        checked: false
                    }));
                this.spermBanks.push({
                    ...this.recipientDetailsObject,
                    id: Date.now(),
                    recipentNumber: this.spermBanks.length + 1,
                    cycles: newCyclesList
                });
                this.spermBanks = this.spermBanks.map((bank, i) => ({
                    ...bank,
                    recipentNumber: i + 1,
                    clinicHeading: i === 0 ? 'Recipient Details' : ''
                }));
            } else {
                alert('Maximum number of recipients reached.');
            }
        } catch (e) {
            console.error('Error in handleAddAnotherClick:', e.message, e.stack);
        }
    }

    handleDeleteConfirm(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            if (!isNaN(index) && index >= 0 && index < this.spermBanks.length) {
                this.spermBanks = this.spermBanks.map(bank => ({
                    ...bank,
                    cycles: bank.cycles.map(cycle => ({ ...cycle }))
                }));
                const recipient = this.spermBanks[index];
                this.deleteIndex = index;
                this.deleteRecipientNumber = recipient.recipentNumber;
                this.showDeletePopup = true;
            }
        } catch (e) {
            console.error('Error in handleDeleteConfirm:', e.message, e.stack);
        }
    }

    async handleDeleteYes() {
        try {
            const index = this.deleteIndex;
            let spermBanksList = this.spermBanks.map(bank => ({
                ...bank,
                cycles: bank.cycles.map(cycle => ({ ...cycle }))
            }));
            const checkedCyclesInDeletedRow = spermBanksList[index].cycles
                .map((cycle, cycleIndex) => cycle.checked ? cycleIndex : null)
                .filter(i => i !== null);

                let agencyId = spermBanksList[index].recipientId;

                if (agencyId) {
                    let resultData = await deleteCycleAgency({ agencyId: recipientId })
                    console.log('Delete Recipient >>> ' + JSON.stringify(resultData));
                }
            spermBanksList.splice(index, 1);
            spermBanksList = spermBanksList.map((bank, i) => ({
                ...bank,
                recipentNumber: i + 1,
                clinicHeading: i === 0 ? 'Recipient Details' : ''
            }));

            checkedCyclesInDeletedRow.forEach(cycleIndex => {
                const isStillSelected = spermBanksList.some(bank => 
                    bank.cycles[cycleIndex]?.checked
                );
                if (!isStillSelected) {
                    spermBanksList.forEach(bank => {
                        bank.cycles[cycleIndex].disabled = false;
                    });
                    const cycleNumber = cycleIndex + 1;
                    const indexInTotal = this.totalSelectedCycles.indexOf(cycleNumber);
                    if (indexInTotal > -1) {
                        this.totalSelectedCycles.splice(indexInTotal, 1);
                    }
                }
            });

            this.spermBanks = spermBanksList;
            this.showNumberedHeadings = this.spermBanks.length > 1;
            this.showDeletePopup = false;
            this.deleteIndex = null;
            this.deleteRecipientNumber = null;
        } catch (e) {
            console.error('Error in handleDeleteYes:', e.message, e.stack);
        }
    }

    handleDeleteNo() {
        try {
            this.showDeletePopup = false;
            this.deleteIndex = null;
            this.deleteRecipientNumber = null;
        } catch (e) {
            console.error('Error in handleDeleteNo:', e.message, e.stack);
        }
    }

    handleRecipientDetailsBack() {
        try {
            this.updateContactObj();
            this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
        } catch (e) {
            console.error('Error in handleRecipientDetailsBack:', e.message, e.stack);
        }
    }

    handleRecipientDetailsNext() {
        try {
            if (this.noSpermBankChecked || this.dontRememberChecked) {
                this.spermBanks[0].noSpermBankChecked = this.noSpermBankChecked;
                this.spermBanks[0].dontRememberChecked = this.dontRememberChecked;
                this.spermBanks[0].totalSelectedCycles = this.totalSelectedCycles;
                this.spermBanks[0].unselectedCycles = this.unselectedCycles;
                this.updateContactObj();
                console.log('Next:', JSON.stringify(this.contactObj));
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
            } else {
                const fieldsMap = new Map([
                    ['recipient1FirstName', 'Please enter Recipient first name'],
                    ['recipient1LastName', 'Please enter Recipient last name'],
                    ['email', 'Please enter recipient email'],
                    ['phone', 'Please enter recipient phone']
                ]);

                let isValid = true;
                this.template.querySelectorAll('lightning-input[data-index]').forEach(input => {
                    if (fieldsMap.has(input.name) && input.value === '' && !this.noSpermBankOrDontRemember && input.name == 'recipient1LastName') {
                        input.setCustomValidity(fieldsMap.get(input.name));
                        input.reportValidity();
                        isValid = false;
                    } else {
                        input.setCustomValidity('');
                        input.reportValidity();
                    }
                });

                if (isValid) {
                    for (let i = 1; i <= this.totalDonationsCount; i++) {
                        if (!this.totalSelectedCycles.includes(i) && !this.unselectedCycles.some(cycle => cycle.cycledId === i)) {
                            this.unselectedCycles.push({
                                label: `Cycle ${i}`,
                                checked: false,
                                disabled: false,
                                confirmedNo: false,
                                cycledId: i,
                                selectedYes: false
                            });
                        }
                    }

                    let navigateToNextScreen = this.totalSelectedCycles.length === this.totalDonationsCount ||
                        this.unselectedCycles.every(cycle => cycle.confirmedNo);

                    if (this.unselectedCycles.length > 0 && !navigateToNextScreen) {
                        this.handleAgencyMissedCycles(true);
                    } else {
                        this.spermBanks[0].totalSelectedCycles = this.totalSelectedCycles;
                        this.spermBanks[0].unselectedCycles = this.unselectedCycles;
                        this.updateContactObj();
                        console.log('Next:', JSON.stringify(this.contactObj));
                        this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                    }
                }
            }
        } catch (e) {
            console.error('Error in handleRecipientDetailsNext:', e.message, e.stack);
        }
    }

    handleAgencyMissedCycles(isModalPopup) {
        try {
            if (isModalPopup) {
                this.unselectedCycles = this.unselectedCycles.filter(cycle =>
                    !this.totalSelectedCycles.includes(cycle.cycledId)
                );
                this.showMissedCycles = this.unselectedCycles.some(cycle => !cycle.confirmedNo);
            } else {
                this.showMissedCycles = false;
                this.showMissedPopupBackButton = false;
            }
        } catch (e) {
            console.error('Error in handleAgencyMissedCycles:', e.message, e.stack);
        }
    }

    handleMissedCycleYesClick(event) {
        try {
            const cycleId = parseInt(event.target.dataset.cycle, 10);
            const cycleName = event.target.dataset.cyclename;
            if (!this.unselectedCyclesFilterList.includes(cycleName)) {
                this.unselectedCyclesFilterList.push(cycleName);
            }
            this.unselectedCycles = this.unselectedCycles.map(cycle => ({
                ...cycle,
                selectedYes: cycle.cycledId === cycleId ? false : cycle.selectedYes
            }));
            this.notInterestedForRecipientCyclesList = this.unselectedCycles.filter(cycle => cycle.selectedYes);
            this.showMissedPopupBackButton = true;
        } catch (e) {
            console.error('Error in handleMissedCycleYesClick:', e.message, e.stack);
        }
    }

    handleMissedCycleNoClick(event) {
        try {
            const cycleId = parseInt(event.target.dataset.cycle, 10);
            this.unselectedCycles = this.unselectedCycles.map(cycle => ({
                ...cycle,
                selectedYes: cycle.cycledId === cycleId ? true : cycle.selectedYes
            }));
            this.notInterestedForRecipientCyclesList = this.unselectedCycles.filter(cycle => cycle.selectedYes);
            this.showMissedPopupBackButton = false;
        } catch (e) {
            console.error('Error in handleMissedCycleNoClick:', e.message, e.stack);
        }
    }

    handleBackFromMissedPopup() {
        try {
            this.unselectedCycles = this.unselectedCycles.filter(cycle =>
                !this.unselectedCyclesFilterList.includes(cycle.label)
            );
            this.unselectedCyclesFilterList = [];
            this.notInterestedForRecipientCyclesList = [];
            this.handleAgencyMissedCycles(false);
        } catch (e) {
            console.error('Error in handleBackFromMissedPopup:', e.message, e.stack);
        }
    }

    handleNextFromMissedPopup() {
        try {
            this.unselectedCycles = this.unselectedCycles.map(cycle => ({
                ...cycle,
                confirmedNo: true
            }));
            this.spermBanks[0].totalSelectedCycles = this.totalSelectedCycles;
            this.spermBanks[0].unselectedCycles = this.unselectedCycles;
            this.updateContactObj();
            console.log('Next from popup:', JSON.stringify(this.contactObj));
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        } catch (e) {
            console.error('Error in handleNextFromMissedPopup:', e.message, e.stack);
        }
    }

    updateContactObj() {
        try {
            this.spermBanks[0].noSpermBankChecked = this.noSpermBankChecked;
            this.spermBanks[0].dontRememberChecked = this.dontRememberChecked;
            this.spermBanks[0].totalSelectedCycles = this.totalSelectedCycles;
            this.spermBanks[0].unselectedCycles = this.unselectedCycles;
            this.contactObj['recipientsWithoutCode'] = this.spermBanks;
            this.contactObj['intendedParentDetails'] = this.intendedParentDetails;
        } catch (e) {
            console.error('Error in updateContactObj:', e.message, e.stack);
        }
    }

    get disablePopupBackBtn() {
        return this.showMissedPopupBackButton ? 'popupBackBtnCls' : 'popupBackBtnDisable';
    }

    get disablePopupNextBtn() {
        return this.showNextFromMissedPopupButton ? 'popupBackBtnCls' : 'popupNextBtnDisable';
    }
}