import { LightningElement, track, api } from 'lwc';
import fetchCodeData from '@salesforce/apex/EggDonorAttorneyWithCodeController.fetchCodeData';
import updateEggAttorniesWithCodes from '@salesforce/apex/EggDonorAttorneyWithCodeController.updateEggAttorniesWithCodes';
import deleteCycleAttorney from '@salesforce/apex/EggDonorAttorneyWithCodeController.deleteCycleAttorney';

export default class DonorPreRegEggFertilityAttorneyWithEDN extends LightningElement {
    @api totalDonationsCount = 9;
    @api contactObj;
    @track donationOutcomes = [];
    @track donationOutcomesListFromApex = [];
    @track noAttorneyChecked = false;
    @track dontRememberChecked = false;
    @track showNumberedHeadings = false;
    @track showDeletePopup = false;
    @track deleteAttorneyNumber = null;
    @track deleteIndex = null;
    @track showInformation = false;
    @track unselectedCycles = [];
    @track showMissedCycles = false;
    @track showMissedPopupBackButton = false;
    @track unselectedCyclesFilterList = [];
    @track notInterestedForAttorneyCyclesList = [];
    @track totalSelectedCycles = [];
    @track intendedParent = {
        Name: '',
        Email: '',
        Phone: ''
    };
    @track showIntendedParentInput = false;
    @track hideIntendedParentInput = true;



    get showNextFromMissedPopupButton() {
        return this.unselectedCycles.length > 0 &&
            this.unselectedCycles.every(cycle => cycle.confirmedNo || cycle.selectedYes);
    }

    get disablePopupBackBtn() {
        return this.showMissedPopupBackButton ? 'popupBackBtnCls' : 'popupBackBtnDisable';
    }


    get disablePopupNextBtn() {
        return this.showNextFromMissedPopupButton ? 'popupBackBtnCls' : 'popupNextBtnDisable';
    }


    async connectedCallback() {
        try {
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj || {}));
            const { donationBasics, isSkipped, attorneysWithCodes = {} } = this.contactObj;
            this.totalDonationsCount = donationBasics?.egg?.liveBirths || 0;

            const cyclesList = Array.from({ length: this.totalDonationsCount }, (_, index) => ({
                index,
                cycleId: `${index + 1}`,
                cycleName: `Cycle ${index + 1}`,
                disabled: false,
                checked: false
            }));

            let finalAttorneys = [];
            const selectedCycleSet = new Set(attorneysWithCodes.totalSelectedCycles || []);

            if (!isSkipped) {
                const attornies = await fetchCodeData({ contactObj: JSON.stringify(this.contactObj) });

                if (attornies?.isSuccess) {
                    const existingAttorneys = attorneysWithCodes.donationOutcomesListFromApex || [];
                    finalAttorneys = JSON.parse(attornies.message).map((outcome, idx) => {
                        const existing = existingAttorneys[idx] || {};
                        const cycles = (existing.cycles || [...cyclesList]).map(cycle => {
                            const id = parseInt(cycle.cycleId);
                            if (cycle.checked) selectedCycleSet.add(id);
                            return { ...cycle };
                        });

                        return {
                            ...outcome,
                            index: idx,
                            cycles,
                            selectedCycles: outcome.selectedCycles || [],
                            noAttorneyChecked: outcome.noAttorneyChecked || false,
                            incorrectAttorneyChecked: existing.incorrectAttorneyChecked || false,
                            primaryConfirmed: existing.primaryConfirmed || false,
                            showDonorCodeInput: !!outcome.showDonorCodeInput,
                            hideDonorCodeInput: outcome.hideDonorCodeInput ?? true,
                            DonorCode: existing.DonorCode || '',
                            PMC: outcome.PMC
                        };
                    });
                }
            }

            this.donationOutcomesListFromApex = finalAttorneys.map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({
                    ...cycle,
                    disabled: selectedCycleSet.has(parseInt(cycle.cycleId)) && !cycle.checked
                }))
            }));


            this.totalSelectedCycles = [...selectedCycleSet];
            this.unselectedCycles = attorneysWithCodes.unselectedCycles || [];


        } catch (e) {
            console.error(`connectedCallback Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    handleApexCycleChange(event) {
        try {
            const outcomeIndex = parseInt(event.target.dataset.index, 10);
            const cycleIndex = parseInt(event.target.dataset.cycleindex, 10);
            const isChecked = event.target.checked;

            console.log('this.donationOutcomesListFromApex >>> ' + JSON.stringify(this.donationOutcomesListFromApex));

            // Deep copy to avoid mutating original state
            let updatedOutcomes = this.donationOutcomesListFromApex.map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({ ...cycle }))
            }));

            updatedOutcomes.forEach((outcome, i) => {
                const currentCycle = outcome.cycles[cycleIndex];

                if (isChecked) {
                    if (i !== outcomeIndex) {
                        currentCycle.checked = false;
                        currentCycle.disabled = true;
                    } else {
                        currentCycle.checked = true;
                        outcome.selectedCycles = [
                            ...outcome.selectedCycles.filter(id => id !== currentCycle.cycleId),
                            currentCycle.cycleId
                        ];
                    }
                } else {
                    if (i !== outcomeIndex) {
                        currentCycle.disabled = false;
                    } else {
                        currentCycle.checked = false;
                        outcome.selectedCycles = outcome.selectedCycles.filter(
                            id => id !== currentCycle.cycleId
                        );
                    }
                }
            });

            // Update tracked list
            this.donationOutcomesListFromApex = [...updatedOutcomes];

            // Maintain total selected cycles
            this.totalSelectedCycles = isChecked
                ? [...new Set([...this.totalSelectedCycles, cycleIndex + 1])]
                : this.totalSelectedCycles.filter(cycle => cycle !== cycleIndex + 1);

            // Toggle information message
            this.showInformation = this.totalSelectedCycles.length > 0;

        } catch (e) {
            console.error(`handleApexCycleChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    handleRadioChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            const field = event.target.value;

            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome =>
                outcome.index === index
                    ? {
                        ...outcome,
                        primaryConfirmed: field === 'primaryConfirmed',
                        incorrectAttorneyChecked: field === 'incorrectAttorneyChecked',
                        noAttorneyChecked: field === 'incorrectAttorneyChecked'
                    }
                    : outcome
            );
        } catch (e) {
            console.error(`handleRadioChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }



    handleIncorrectAttorneyChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome =>
                outcome.index === index
                    ? {
                        ...outcome,
                        incorrectAttorneyChecked: event.target.checked,
                        noAttorneyChecked: event.target.checked ? true : false,
                        primaryConfirmed: event.target.checked ? false : outcome.primaryConfirmed
                    }
                    : outcome
            );
        } catch (e) {
            console.error(`handleIncorrectAttorneyChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }

    handlePrimaryConfirmedChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome =>
                outcome.index === index
                    ? {
                        ...outcome,
                        primaryConfirmed: event.target.checked,
                        incorrectAttorneyChecked: event.target.checked ? false : outcome.incorrectAttorneyChecked,
                        noAttorneyChecked: event.target.checked ? false : outcome.noAttorneyChecked
                    }
                    : outcome
            );
        } catch (e) {
            console.error(`handlePrimaryConfirmedChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }

    handleApexInputChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            const field = event.target.name;
            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome =>
                outcome.index === index
                    ? { ...outcome, [field]: event.target.value }
                    : outcome
            );
            const input = event.target;
            if (input.validity.valid) {
                input.setCustomValidity('');
                input.reportValidity();
            }
        } catch (e) {
            console.error(`handleApexInputChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    handleApexRadioChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            const value = event.target.value;
            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome =>
                outcome.index === index
                    ? {
                        ...outcome,
                        showDonorCodeInput: value === 'yes',
                        hideDonorCodeInput: value === 'no',
                        DonorCode: value === 'no' ? '' : outcome.DonorCode
                    }
                    : outcome
            );
        } catch (e) {
            console.error(`handleApexRadioChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    handleInputBlur(event) {
        try {
            const input = event.target;
            const fieldName = input.name;
            const value = input.value;
            const fieldsMap = new Map([
                ['Name', 'Please enter attorney name'],
                ['Website', 'Please enter website'],
                ['Phone', 'Please enter phone number'],
                ['Email', 'Please enter email'],
                ['State', 'Please enter state'],
                ['DonorCode', 'Please enter donor code'],
                ['Name', 'Please enter intended parent name']
            ]);

            if (fieldsMap.has(fieldName)) {
                if (fieldName === 'Name' && this.showIntendedParentInput && value === '') {
                    input.setCustomValidity(fieldsMap.get(fieldName));
                    input.reportValidity();
                } else if (['Name', 'Website', 'Phone', 'Email', 'State'].includes(fieldName)) {
                    const outcome = this.donationOutcomesListFromApex.find(o => o.index === parseInt(input.dataset.index)) ||
                        this.donationOutcomes.find(o => o.index === parseInt(input.dataset.index));
                    if (outcome && !outcome.noAttorneyChecked) {
                        if (fieldName === 'DonorCode' && value === '' && outcome.showDonorCodeInput) {
                            input.setCustomValidity(fieldsMap.get(fieldName));
                        } else if (fieldName !== 'DonorCode' && fieldName !== 'LawFirm' && value === '') {
                            input.setCustomValidity(fieldsMap.get(fieldName));
                        } else {
                            input.setCustomValidity('');
                        }
                        input.reportValidity();
                    }
                } else {
                    input.setCustomValidity('');
                    input.reportValidity();
                }
            }
        } catch (e) {
            console.error(`handleInputBlur Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }

    handleEggAttorneyWithEDNBack() {
        try {
            this.updateContactObj();
            this.dispatchEvent(new CustomEvent('back', {
                detail: this.contactObj
            }));
        } catch (e) {
            console.error(`handleEggAttorneyWithEDNBack Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }

    async handleEggAttorneyWithEDNNext() {
        try {
            this.unselectedCycles = [];
            for (let i = 1; i <= this.totalDonationsCount; i++) {
                if (!this.totalSelectedCycles.includes(i)) {
                    let alreadyExists = this.unselectedCycles.some(cycle => cycle.cycledId === i);
                    if (!alreadyExists) {
                        let obj = {
                            label: `Cycle ${i}`,
                            checked: false,
                            disabled: false,
                            confirmedNo: this.unselectedCycles.find(c => c.cycledId === i)?.confirmedNo || false,
                            cycledId: i,
                            selectedYes: this.unselectedCycles.find(c => c.cycledId === i)?.selectedYes || false
                        };
                        this.unselectedCycles.push(obj);
                    }
                }
            }

            if (this.unselectedCycles.length > 0) {
                this.handleAttorneyMissedCycles(true);
            } else {
                this.updateContactObj();
                let param = {
                    donorId: this.contactObj.donorId,
                    attorneyData: JSON.stringify(this.contactObj.attorneysWithCodes.donationOutcomesListFromApex)
                }
                let result = await updateEggAttorniesWithCodes(param);
                console.log('Result updateEggAttorniesWithCodes >>> ' + JSON.stringify(result));
                if (result.isSuccess) {
                    this.dispatchEvent(new CustomEvent('next', {
                        detail: this.contactObj
                    }));
                }
            }
        } catch (e) {
            console.error(`handleEggAttorneyWithEDNNext Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }

    handleAttorneyMissedCycles(isModalPopup) {
        try {
            if (isModalPopup) {
                this.unselectedCycles = this.unselectedCycles
                    .filter(cycle => !this.totalSelectedCycles.includes(cycle.cycledId))
                    .sort((a, b) => a.cycledId - b.cycledId);
                this.showMissedCycles = this.unselectedCycles.some(cycle => !cycle.confirmedNo && !cycle.selectedYes);
            } else {
                this.showMissedCycles = false;
                this.showMissedPopupBackButton = false;
                this.unselectedCyclesFilterList = [];
                this.notInterestedForAttorneyCyclesList = [];
            }
        } catch (e) {
            console.error(`handleAttorneyMissedCycles Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }

    handleMissedCycleYesClick(event) {
        let cyclename = event.target.dataset.cyclename;
        let cycleId = parseInt(event.target.dataset.cycle, 10);

        if (!this.unselectedCyclesFilterList.includes(cyclename)) {
            this.unselectedCyclesFilterList.push(cyclename);
        }

        this.unselectedCycles = this.unselectedCycles.map(cycle => {
            let obj = { ...cycle }
            if (cycle['cycledId'] == cycleId) {
                obj['selectedYes'] = false;
            }
            return obj;
        });
        this.notIntrestedForAgencyCyclesList = this.unselectedCycles.filter(cycle => cycle.selectedYes == true);
        console.log(JSON.stringify(this.unselectedCycles));
        this.notIntrestedForAgencyCyclesList = [];
        this.showMissedPopupBackButton = true;
    }

    handleMissedCycleNoClick(event) {
        try {
            let cyclename = event.target.dataset.cyclename;
            let cycleId = parseInt(event.target.dataset.cycle, 10);
            //this.notIntrestedForAgencyCyclesList
            //obj['cycledId'] = i;
            //obj['selectedYes'] = "No"
            this.unselectedCycles = this.unselectedCycles.map(cycle => {
                let obj = { ...cycle }
                if (cycle['cycledId'] == cycleId) {
                    obj['selectedYes'] = true;
                }
                return obj;
            });
            this.notIntrestedForAgencyCyclesList = this.unselectedCycles.filter(cycle => cycle.selectedYes == true);
            console.log(JSON.stringify(this.unselectedCycles));

            this.showMissedPopupBackButton = false;
        }
        catch (e) {
            console.error(`handleMissedCycleNoClick Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }

    }

    handleBackFromMissedPopup() {
        try {
            this.unselectedCycles = this.unselectedCycles.filter(cycle => cycle.confirmedNo);
            this.unselectedCyclesFilterList = [];
            this.notInterestedForAttorneyCyclesList = [];
            this.showMissedPopupBackButton = false;
            this.showMissedCycles = false;
        } catch (e) {
            console.error(`handleBackFromMissedPopup Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }

    async handleNextFromMissedPopup() {
        try {
            this.unselectedCycles = this.unselectedCycles.map(cycle => ({
                ...cycle,
                confirmedNo: true
            }));
            this.showMissedCycles = false;
            this.showMissedPopupBackButton = false;
            this.unselectedCyclesFilterList = [];
            this.notInterestedForAttorneyCyclesList = [];
            this.updateContactObj();

            let param = {
                donorId: this.contactObj.donorId,
                attorneyData: JSON.stringify(this.contactObj.attorneysWithCodes.donationOutcomesListFromApex)
            }
            let result = await updateEggAttorniesWithCodes(param);
            console.log('Result updateEggAttorniesWithCodes >>> ' + JSON.stringify(result));
            if (result.isSuccess) {
                this.dispatchEvent(new CustomEvent('next', {
                    detail: this.contactObj
                }));
            }

        } catch (e) {
            console.error(`handleNextFromMissedPopup Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    updateContactObj() {
        try {
            console.log('this.contactObj Before >>> ' + JSON.stringify(this.contactObj));
            this.contactObj['attorneysWithCodes'] = {
                donationOutcomesListFromApex: this.donationOutcomesListFromApex.map(outcome => ({
                    ...outcome,
                    cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                    selectedCycles: outcome.selectedCycles
                })),
                totalSelectedCycles: this.totalSelectedCycles,
                unselectedCycles: this.unselectedCycles
            };
            console.log('this.contactObjBefore After >>> ' + JSON.stringify(this.contactObj));
        } catch (e) {
            console.error(`updateContactObj Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }
}