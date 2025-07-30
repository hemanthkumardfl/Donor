import { LightningElement, track, api } from 'lwc';
import fetchCodeData from '@salesforce/apex/EggDonorAgencyWithCodeController.fetchCodeData';
import updateEggAgenciesWithCodes from '@salesforce/apex/EggDonorAgencyWithCodeController.updateEggAgenciesWithCodes';
import deleteCycleAgency from '@salesforce/apex/EggDonorAgencyWithCodeController.deleteCycleAgency'

export default class DonorPreRegEggAgencyWithEDN extends LightningElement {

    @api totalDonationsCount;
    @api contactObj;
    @track donationOutcomes = [];
    @track donationOutcomesListFromApex = [];
    @track noAgencyChecked = false;
    @track dontRememberChecked = false;
    @track showNumberedHeadings = false;
    @track showDeletePopup = false;
    @track deleteAgencyNumber = null;
    @track deleteIndex = null;
    @track showInformation = false;
    @track unselectedCycles = [];
    @track showMissedCycles = false;
    @track showMissedPopupBackButton = false;
    @track unselectedCyclesFilterList = [];
    @track notIntrestedForAgencyCyclesList = [];
    @track totalSelectedCycles = [];
    @track workWithAgencyYes;
    @track workWithAgencyNo;


    get isHideAddAnotherAgency() {
        return (this.noAgencyChecked || this.dontRememberChecked);
    }


    get noAgencyOrDontRemember() {
        return this.noAgencyChecked || this.dontRememberChecked;
    }


    get checkboxStatus() {
        return this.donationOutcomes.length > 1 || this.hasAgencyDetails() || this.donationOutcomesListFromApex.some(outcome => outcome.primaryConfirmed || outcome.incorrectAgencyChecked);
    }


    get disableAddAnotherAgency() {
        let clsName = 'textcls addagencycls inputscls';
        if (this.donationOutcomesListFromApex.length + this.donationOutcomes.length >= this.totalDonationsCount || this.noAgencyOrDontRemember) {
            clsName += ' disableAddAnotherClickCls';
        }
        return clsName;
    }


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

    get showAddAnother() {
        return (this.donationOutcomesListFromApex.length + this.donationOutcomes.length < this.totalDonationsCount)
    }


    async connectedCallback() {
        try {
            const { donationBasics, isSkipped, agenciesWithCodes = {} } = this.contactObj || {};
            this.totalDonationsCount = donationBasics?.egg?.liveBirths || 0;
    
            const cyclesList = Array.from({ length: this.totalDonationsCount }, (_, index) => ({
                index,
                cycleId: `${index + 1}`,
                cycleName: `Cycle ${index + 1}`,
                disabled: false,
                checked: false
            }));
    
            let finalAgencies = [];
            const selectedCycleSet = new Set(agenciesWithCodes.totalSelectedCycles || []);
    
            if (!isSkipped) {
                const agencies = await fetchCodeData({ contactObj: JSON.stringify(this.contactObj) });
                console.log('fetchCodeData Result >>> ', agencies);
    
                if (agencies?.isSuccess) {
                    const existingAgencies = agenciesWithCodes.donationOutcomesListFromApex || [];
                    finalAgencies = JSON.parse(agencies.message).map((outcome, idx) => {
                        const existing = existingAgencies[idx] || {};
                        const cycles = (existing.cycles || [...cyclesList]).map(cycle => {
                            const id = parseInt(cycle.cycleId);
                            const isChecked = cycle.checked;
                            if (isChecked) selectedCycleSet.add(id);
                            return { ...cycle, checked: isChecked };
                        });
    
                        return {
                            ...outcome,
                            index: idx,
                            cycles,
                            selectedCycles: outcome.selectedCycles || [],
                            noAgencyChecked: outcome.noAgencyChecked || false,
                            incorrectAgencyChecked: existing.incorrectAgencyChecked || false,
                            primaryConfirmed: existing.primaryConfirmed || false,
                            showDonorCodeInput: !!outcome.showDonorCodeInput,
                            hideDonorCodeInput: outcome.hideDonorCodeInput ?? true,
                            CityStateOfAgency: outcome.CityStateOfAgency || '',
                            CoordinatorName: outcome.CoordinatorName || '',
                            PMC: outcome.PMC,
                            filter: {
                                criteria: [{ fieldPath: 'AccountId', operator: 'eq', value: outcome.AgencyId }]
                            }
                        };
                    });
                }
            }
    
            // Final pass to mark disabled cycles in one loop
            this.donationOutcomesListFromApex = finalAgencies.map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({
                    ...cycle,
                    disabled: selectedCycleSet.has(parseInt(cycle.cycleId)) && !cycle.checked
                }))
            }));
    
            this.noAgencyChecked = agenciesWithCodes.noOtherAgencies || false;
            this.workWithAgencyYes = this.noAgencyChecked;
            this.workWithAgencyNo = !this.noAgencyChecked;
            this.dontRememberChecked = agenciesWithCodes.dontRememberAgencies || false;
            this.totalSelectedCycles = [...selectedCycleSet];
            this.unselectedCycles = agenciesWithCodes.unselectedCycles || [];

            console.log('donationOutcomesListFromApex >>> '+JSON.stringify(this.donationOutcomesListFromApex));
    
        } catch (e) {
            console.error(`connectedCallback Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }
    


    hasAgencyDetails() {
        return this.donationOutcomes.some(outcome =>
            outcome.Name || outcome.Website || outcome.Phone || outcome.Email || outcome.CoordinatorName ||
            (outcome.showDonorCodeInput && outcome.DonorCode) || outcome.CityStateOfAgency ||
            outcome.cycles.some(cycle => cycle.checked)
        );
    }


    handleDeleteConfirm(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            this.donationOutcomes = this.donationOutcomes.map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({ ...cycle }))
            }));
            const agency = this.donationOutcomes.find(outcome => outcome.index === index);
            this.deleteIndex = index;
            this.deleteAgencyNumber = agency ? agency.headingIndex : null;
            this.showDeletePopup = true;
        } catch (e) {
            console.error(`handleDeleteConfirm Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
        }
    }


    async handleDeleteYes() {
        try {
            const index = this.deleteIndex;
            let outcomesList = this.donationOutcomes.map(outcome => ({


                ...outcome,
                cycles: outcome.cycles.map(cycle => ({ ...cycle }))
            }));

            const checkedCyclesInDeletedRow = outcomesList[index].cycles
                .map((cycle, cycleIndex) => cycle.checked ? cycleIndex : null)
                .filter(i => i !== null);

            let agencyId = outcomesList[index].agencyId;
            if (agencyId) {
                let resultData = await deleteCycleAgency({ agencyId: agencyId });
                console.log('deleteCycleAgency Result >>> ' + JSON.stringify(resultData));
                if (resultData.isSuccess) {
                    outcomesList.splice(index, 1);
                }
            }
            else {
                outcomesList.splice(index, 1);
            }
            outcomesList.forEach((outcome, i) => {
                outcome.index = i;
                outcome.headingIndex = i + 1;
                outcome.agencyHeading = i === 0 ? 'Additional Agencies' : '';
            });

            if (outcomesList.length === 0) {
                outcomesList.push({
                    ...this.donationOutcomeObject,
                    index: 0,
                    headingIndex: 1,
                    cycles: Array(this.totalDonationsCount)
                        .fill()
                        .map((_, index) => ({
                            index: index,
                            cycleId: `${index + 1}`,
                            cycleName: `Cycle ${index + 1}`,
                            disabled: this.totalSelectedCycles.includes(index + 1),
                            checked: false
                        }))
                });
            }

            checkedCyclesInDeletedRow.forEach(cycleIndex => {
                const isStillSelected = outcomesList.some(outcome =>
                    outcome.cycles[cycleIndex]?.checked
                ) || this.donationOutcomesListFromApex.some(outcome =>
                    outcome.cycles[cycleIndex]?.checked
                );

                if (!isStillSelected) {
                    outcomesList.forEach(outcome => {
                        outcome.cycles[cycleIndex].disabled = false;
                    });
                    this.donationOutcomesListFromApex.forEach(outcome => {
                        outcome.cycles[cycleIndex].disabled = false;
                    });

                    const cycleNumber = cycleIndex + 1;
                    const indexInTotal = this.totalSelectedCycles.indexOf(cycleNumber);
                    if (indexInTotal > -1) {
                        this.totalSelectedCycles.splice(indexInTotal, 1);
                    }
                }
            });

            this.donationOutcomes = outcomesList;
            this.showNumberedHeadings = this.donationOutcomes.length > 1;
            this.showDeletePopup = false;
            this.deleteIndex = null;
            this.deleteAgencyNumber = null;
        } catch (e) {
            console.error(`handleDeleteYes Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
        }
    }


    handleDeleteNo() {
        try {
            this.showDeletePopup = false;
            this.deleteIndex = null;
            this.deleteAgencyNumber = null;
        } catch (e) {
            console.error(`handleDeleteNo Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
        }
    }


    handleCycleChange(event) {
        try {
            let outComeRecordIndex = parseInt(event.target.dataset.outcomeindex);
            let cycleIndex = parseInt(event.target.dataset.cycleindex);
            let outcomesList = this.donationOutcomes.map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({ ...cycle }))
            }));

            for (let i = 0; i < outcomesList.length; i++) {
                if (event.target.checked) {
                    if (i !== outComeRecordIndex) {
                        outcomesList[i].cycles[cycleIndex].checked = false;
                        outcomesList[i].cycles[cycleIndex].disabled = true;
                    }
                    if (i === outComeRecordIndex) {
                        outcomesList[outComeRecordIndex].cycles[cycleIndex].checked = event.target.checked;
                        outcomesList[outComeRecordIndex].selectedCycles = [
                            ...outcomesList[outComeRecordIndex].selectedCycles.filter(id => id !== outcomesList[outComeRecordIndex].cycles[cycleIndex].cycleId),
                            outcomesList[outComeRecordIndex].cycles[cycleIndex].cycleId
                        ];
                    }
                } else {
                    if (i !== outComeRecordIndex) {
                        outcomesList[i].cycles[cycleIndex].disabled = false;
                    }
                    if (i === outComeRecordIndex) {
                        outcomesList[outComeRecordIndex].cycles[cycleIndex].checked = event.target.checked;
                        outcomesList[outComeRecordIndex].selectedCycles = outcomesList[outComeRecordIndex].selectedCycles.filter(
                            id => id !== outcomesList[outComeRecordIndex].cycles[cycleIndex].cycleId
                        );
                    }
                }
            }

            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({
                    ...cycle,
                    disabled: event.target.checked && cycle.index === cycleIndex ? true : (!this.totalSelectedCycles.includes(parseInt(cycle.cycleId)) ? false : (cycle.index === cycleIndex) ? false : cycle.disabled)
                }))
            }));

            this.donationOutcomes = [...outcomesList];
            if (event.target.checked) {
                if (!this.totalSelectedCycles.includes(cycleIndex + 1)) {
                    this.totalSelectedCycles.push(cycleIndex + 1);
                }
            } else {
                this.totalSelectedCycles = this.totalSelectedCycles.filter(
                    selectedCycle => selectedCycle !== cycleIndex + 1
                );
            }
            this.showInformation = this.totalSelectedCycles.length > 0 && this.noAgencyOrDontRemember;
        } catch (e) {
            console.error(`handleCycleChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
        }
    }


    handleApexCycleChange(event) {
        try {
            let outComeRecordIndex = parseInt(event.target.dataset.outcomeindex);
            let cycleIndex = parseInt(event.target.dataset.cycleindex);
            let outcomesList = this.donationOutcomesListFromApex.map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({ ...cycle }))
            }));

            for (let i = 0; i < outcomesList.length; i++) {
                if (event.target.checked) {
                    if (i !== outComeRecordIndex) {
                        outcomesList[i].cycles[cycleIndex].checked = false;
                        outcomesList[i].cycles[cycleIndex].disabled = true;
                    }
                    if (i === outComeRecordIndex) {
                        outcomesList[outComeRecordIndex].cycles[cycleIndex].checked = event.target.checked;
                        outcomesList[outComeRecordIndex].selectedCycles = [
                            ...outcomesList[outComeRecordIndex].selectedCycles.filter(id => id !== outcomesList[outComeRecordIndex].cycles[cycleIndex].cycleId),
                            outcomesList[outComeRecordIndex].cycles[cycleIndex].cycleId
                        ];
                    }
                } else {
                    if (i !== outComeRecordIndex) {
                        outcomesList[i].cycles[cycleIndex].disabled = false;
                    }
                    if (i === outComeRecordIndex) {
                        outcomesList[outComeRecordIndex].cycles[cycleIndex].checked = event.target.checked;
                        outcomesList[outComeRecordIndex].selectedCycles = outcomesList[outComeRecordIndex].selectedCycles.filter(
                            id => id !== outcomesList[outComeRecordIndex].cycles[cycleIndex].cycleId
                        );
                    }
                }
            }
            this.donationOutcomes = this.donationOutcomes.map(outcome => {
                return {
                    ...outcome,
                    cycles: outcome.cycles.map(cycle => {
                        const isCurrent = cycle.index === cycleIndex;
                        const isChecked = event.target.checked;
                        const isAlreadySelected = this.totalSelectedCycles.includes(parseInt(cycle.cycleId));

                        let disabled;
                        if (isChecked && isCurrent) {
                            disabled = isChecked;
                        } else if (!isAlreadySelected) {
                            disabled = false;
                        } else {
                            if (isCurrent) {
                                disabled = false;
                            }
                            else {
                                disabled = cycle.disabled;
                            }
                        }

                        return {
                            ...cycle,
                            disabled
                        };
                    })
                };
            });

            // Added Comment for Apex Related Data
            this.donationOutcomesListFromApex = [...outcomesList];
            if (event.target.checked) {
                if (!this.totalSelectedCycles.includes(cycleIndex + 1)) {
                    this.totalSelectedCycles.push(cycleIndex + 1);
                }
            } else {
                this.totalSelectedCycles = this.totalSelectedCycles.filter(
                    selectedCycle => selectedCycle !== cycleIndex + 1
                );
            }
            this.showInformation = this.totalSelectedCycles.length > 0 && this.noAgencyOrDontRemember;
        } catch (e) {
            console.error(`handleApexCycleChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
        }
    }


    handleNoAgencyChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome => {
                if (outcome.index === index) {
                    const noAgencyChecked = event.target.checked;
                    const cycles = outcome.cycles.map(cycle => ({
                        ...cycle,
                        checked: noAgencyChecked ? false : cycle.checked,
                        disabled: noAgencyChecked ? true : (this.totalSelectedCycles.includes(parseInt(cycle.cycleId)) && !cycle.checked)
                    }));
                    if (noAgencyChecked) {
                        cycles.forEach(cycle => {
                            if (cycle.checked) {
                                const cycleNumber = parseInt(cycle.cycleId);
                                this.totalSelectedCycles = this.totalSelectedCycles.filter(
                                    selectedCycle => selectedCycle !== cycleNumber
                                );
                            }
                        });
                    }
                    return {
                        ...outcome,
                        noAgencyChecked,
                        incorrectAgencyChecked: noAgencyChecked ? false : outcome.incorrectAgencyChecked,
                        primaryConfirmed: noAgencyChecked ? false : outcome.primaryConfirmed,
                        Name: noAgencyChecked ? '' : outcome.Name,
                        Website: noAgencyChecked ? '' : outcome.Website,
                        Phone: noAgencyChecked ? '' : outcome.Phone,
                        Email: noAgencyChecked ? '' : outcome.Email,
                        CoordinatorName: noAgencyChecked ? '' : outcome.CoordinatorName,
                        DonorCode: noAgencyChecked ? '' : outcome.DonorCode,
                        showDonorCodeInput: noAgencyChecked ? false : outcome.showDonorCodeInput,
                        hideDonorCodeInput: noAgencyChecked ? true : outcome.hideDonorCodeInput,
                        cycles,
                        selectedCycles: noAgencyChecked ? [] : outcome.selectedCycles,
                        CityStateOfAgency: noAgencyChecked ? '' : outcome.CityStateOfAgency
                    };
                }
                return outcome;
            });
            this.showInformation = this.totalSelectedCycles.length > 0 && this.noAgencyOrDontRemember;
        } catch (e) {
            console.error(`handleNoAgencyChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
        }
    }


    handleNoAdditionalAgencyChange(event) {
        try {
            this.noAgencyChecked = event.target.checked;
            if (this.noAgencyChecked) {
                this.dontRememberChecked = false;
                let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
                if (cycleCheckboxclsList.length > 0) {
                    let anyChecked = false;
                    cycleCheckboxclsList.forEach(cycle => {
                        if (cycle.checked && cycle.dataset.name == 'additional') {
                            anyChecked = true;
                        }
                    });
                    if (anyChecked) {
                        this.noAgencyChecked = false;
                        this.showInformation = true;
                        return;
                    }
                }
                this.showInformation = false;
                this.donationOutcomes = [];
                this.totalSelectedCycles = this.donationOutcomesListFromApex.reduce((acc, outcome) => {
                    outcome.cycles.forEach(cycle => {
                        if (cycle.checked && !acc.includes(parseInt(cycle.cycleId))) {
                            acc.push(parseInt(cycle.cycleId));
                        }
                    });
                    return acc;
                }, []);
            } else {
                this.showInformation = this.totalSelectedCycles.length > 0 && this.noAgencyOrDontRemember;
            }
        } catch (e) {
            console.error(`handleNoAdditionalAgencyChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
        }
    }


    handleDontRememberChange(event) {
        try {
            this.dontRememberChecked = event.target.checked;
            if (this.dontRememberChecked) {
                this.noAgencyChecked = false;
                let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
                if (cycleCheckboxclsList.length > 0) {
                    let anyChecked = false;
                    cycleCheckboxclsList.forEach(cycle => {
                        if (cycle.checked && cycle.dataset.name == 'additional') {
                            anyChecked = true;
                        }
                    });
                    if (anyChecked) {
                        this.dontRememberChecked = false;
                        this.showInformation = true;
                        return;
                    }
                }
                this.showInformation = false;
                this.donationOutcomes = [] /*this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    Name: '',
                    Website: '',
                    Phone: '',
                    Email: '',
                    CoordinatorName: '',
                    DonorCode: '',
                    showDonorCodeInput: false,
                    hideDonorCodeInput: true,
                    cycles: outcome.cycles.map(cycle => ({
                        ...cycle,
                        disabled: true,
                        checked: false
                    })),
                    selectedCycles: [],
                    CityStateOfAgency: ''
                })); */
                this.totalSelectedCycles = this.donationOutcomesListFromApex.reduce((acc, outcome) => {
                    outcome.cycles.forEach(cycle => {
                        if (cycle.checked && !acc.includes(parseInt(cycle.cycleId))) {
                            acc.push(parseInt(cycle.cycleId));
                        }
                    });
                    return acc;
                }, []);
            } else {
                // this.donationOutcomes = this.donationOutcomes.map(outcome => ({
                //     ...outcome,
                //     cycles: outcome.cycles.map(cycle => ({
                //         ...cycle,
                //         disabled: this.totalSelectedCycles.includes(parseInt(cycle.cycleId))
                //     }))
                // }));
                this.showInformation = this.totalSelectedCycles.length > 0 && this.noAgencyOrDontRemember;
            }
        } catch (e) {
            console.error(`handleDontRememberChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
        }
    }


    handleIncorrectAgencyChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome =>
                outcome.index === index
                    ? {
                        ...outcome,
                        incorrectAgencyChecked: event.target.checked,
                        noAgencyChecked: event.target.checked ? true : false,
                        primaryConfirmed: event.target.checked ? false : outcome.primaryConfirmed
                    }
                    : outcome
            );
        } catch (e) {
            console.error(`handleIncorrectAgencyChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
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
                        incorrectAgencyChecked: event.target.checked ? false : outcome.incorrectAgencyChecked,
                        noAgencyChecked: event.target.checked ? false : outcome.noAgencyChecked
                    }
                    : outcome
            );
        } catch (e) {
            console.error(`handlePrimaryConfirmedChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
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
            console.error(`handleApexInputChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
        }
    }


    handleInputChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            const field = event.target.name;
            this.donationOutcomes = this.donationOutcomes.map(outcome =>
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
            console.error(`handleInputChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`)
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


    handleRadioChange(event) {
        try {
            let value = event.target.value;
            this.noAgencyChecked = (value == 'No');
            if (this.noAgencyChecked) {
                this.dontRememberChecked = false;
                let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
                if (cycleCheckboxclsList.length > 0) {
                    let anyChecked = false;
                    cycleCheckboxclsList.forEach(cycle => {
                        if (cycle.checked && cycle.dataset.name == 'additional') {
                            anyChecked = true;
                        }
                    });
                    if (anyChecked) {
                        this.noAgencyChecked = false;
                        this.showInformation = true;
                        return;
                    }
                }
                this.showInformation = false;
                this.donationOutcomes = [];
                this.totalSelectedCycles = this.donationOutcomesListFromApex.reduce((acc, outcome) => {
                    outcome.cycles.forEach(cycle => {
                        if (cycle.checked && !acc.includes(parseInt(cycle.cycleId))) {
                            acc.push(parseInt(cycle.cycleId));
                        }
                    });
                    return acc;
                }, []);
            } else {
                this.showInformation = this.totalSelectedCycles.length > 0 && this.noAgencyOrDontRemember;
            }
        } catch (e) {
            console.error(`handleRadioChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    handleInputBlur(event) {
        try {
            const input = event.target;
            const fieldName = input.name;
            const value = input.value;
            const fieldsMap = new Map([
                ['Name', 'Please enter agency name'],
                ['Website', 'Please enter website'],
                ['Phone', 'Please enter phone number'],
                ['Email', 'Please enter email'],
                ['CoordinatorName', 'Please enter coordinator name'],
                ['DonorCode', 'Please enter donor code'],
                ['CityStateOfAgency', 'Please enter city/state']
            ]);

            if (fieldsMap.has(fieldName) && !this.noAgencyOrDontRemember) {
                const outcome = this.donationOutcomesListFromApex.find(o => o.index === parseInt(input.dataset.index)) ||
                    this.donationOutcomes.find(o => o.index === parseInt(input.dataset.index));
                if (outcome && !outcome.noAgencyChecked) {
                    if (fieldName === 'DonorCode' && value === '' && outcome.showDonorCodeInput) {
                        input.setCustomValidity(fieldsMap.get(fieldName));
                    } else if (fieldName !== 'DonorCode' && fieldName !== 'CoordinatorName' && value === '') {
                        input.setCustomValidity(fieldsMap.get(fieldName));
                    } else {
                        input.setCustomValidity('');
                    }
                    input.reportValidity();
                }
            }
        } catch (e) {
            console.error(`handleInputBlur Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    handleEggAgencyWithEDNBack() {
        try {
            this.updateContactObj();
            this.dispatchEvent(new CustomEvent('back', {
                detail: this.contactObj
            }));
        } catch (e) {
            console.error(`handleEggAgencyWithEDNBack Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    async handleEggAgencyWithEDNNext() {
        try {
            this.showInformation = false;
            if (this.noAgencyChecked) {
                let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
                if (cycleCheckboxclsList.length > 0) {
                    let anyChecked = false;
                    cycleCheckboxclsList.forEach(cycle => {
                        if (cycle.checked) {
                            anyChecked = true;
                        }
                    });
                    if (anyChecked) {
                        this.contactObj['agenciesWithCodes'] = {
                            donationOutcomesListFromApex: this.donationOutcomesListFromApex.map(outcome => ({
                                ...outcome,
                                CityStateOfAgency: outcome.CityStateOfAgency,
                                cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                                selectedCycles: outcome.selectedCycles
                            })),
                        }
                        let existingAgencies = JSON.stringify(this.contactObj['agenciesWithCodes']['donationOutcomesListFromApex']);
                        let addedAgencies = JSON.stringify([]);
                        let cycles = JSON.stringify(this.contactObj['allCycles']);
                        let result = await updateEggAgenciesWithCodes({ existingAgencies: existingAgencies, addedAgencies: addedAgencies, cycles: cycles });
                        console.log('updateEggAgenciesWithCodes Result >>> ' + JSON.stringify(result));
                        if (result.isSuccess) {
                            let obj = JSON.parse(result.message);
                            this.contactObj['agenciesWithCodes']['additionalAgencies'] = obj;
                            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                        }
                        // this.showInformation = true;
                        // return;
                    }
                }
                this.updateContactObj();
                this.dispatchEvent(new CustomEvent('next', {
                    detail: this.contactObj
                }));
                return;
            }

            const fieldsMap = new Map([
                ['Name', 'Please enter agency name'],
                ['Website', 'Please enter website'],
                ['Phone', 'Please enter phone number'],
                ['Email', 'Please enter email'],
                ['CityStateOfAgency', 'Please enter city/state'],
                ['DonorCode', 'Please enter donor code']
            ]);

            let isValid = true;
            this.template.querySelectorAll('lightning-input[data-index]').forEach(input => {
                if (input.type !== 'checkbox') {
                    const fieldName = input.name;
                    const value = input.value;
                    const outcome = this.donationOutcomesListFromApex.find(o => o.index === parseInt(input.dataset.index)) ||
                        this.donationOutcomes.find(o => o.index === parseInt(input.dataset.index));
                    if (!outcome || (outcome && !outcome.noAgencyChecked)) {
                        if (fieldName === 'DonorCode' && value === '' && outcome?.showDonorCodeInput) {
                            input.setCustomValidity(fieldsMap.get(fieldName));
                            input.reportValidity();
                            isValid = false;
                        } else if (fieldName !== 'DonorCode' && fieldName !== 'CoordinatorName' && value === '' && fieldName === 'Name') {
                            input.setCustomValidity(fieldsMap.get(fieldName));
                            input.reportValidity();
                            isValid = false;
                        } else {
                            input.setCustomValidity('');
                            input.reportValidity();
                        }
                    }
                }
            });

            if (!isValid) {
                return;
            }

            let allConfirmed = true;
            this.donationOutcomesListFromApex.forEach(outcome => {
                if (!outcome.incorrectAgencyChecked) {
                    outcome.incorrectAgencyChecked = true;
                }
            });


            this.donationOutcomesListFromApex.forEach(outcome => {
                if (!outcome.noAgencyChecked && !outcome.primaryConfirmed && !outcome.incorrectAgencyChecked) {
                    allConfirmed = false;
                }
            });

            if (!allConfirmed) {
                alert('Please confirm the status of each agency (correct, incorrect, or did not work with) before proceeding.');
                return;
            }

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
                this.handleAgencyMissedCycles(true);
            } else {
                this.updateContactObj();
                let existingAgencies = JSON.stringify(this.contactObj['agenciesWithCodes']['donationOutcomesListFromApex']);
                let addedAgencies = JSON.stringify(this.contactObj['agenciesWithCodes']['additionalAgencies'])
                let cycles = JSON.stringify(this.contactObj['allCycles']);
                let result = await updateEggAgenciesWithCodes({ existingAgencies: existingAgencies, addedAgencies: addedAgencies, cycles: cycles });
                if (result.isSuccess) {
                    let obj = JSON.parse(result.message);
                    this.contactObj['agenciesWithCodes']['additionalAgencies'] = obj;
                    this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                }
            }
        } catch (e) {
            console.error(`handleEggAgencyWithEDNNext Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    handleAgencyMissedCycles(isModalPopup) {
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
                this.notIntrestedForAgencyCyclesList = [];
            }
        } catch (e) {
            console.error(`handleAgencyMissedCycles Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
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
            this.notIntrestedForAgencyCyclesList = [];
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
            this.notIntrestedForAgencyCyclesList = [];
            this.updateContactObj();
            let existingAgencies = JSON.stringify(this.contactObj['agenciesWithCodes']['donationOutcomesListFromApex']);
            let addedAgencies = JSON.stringify(this.contactObj['agenciesWithCodes']['additionalAgencies'])
            let cycles = JSON.stringify(this.contactObj['allCycles']);
            let result = await updateEggAgenciesWithCodes({ existingAgencies: existingAgencies, addedAgencies: addedAgencies, cycles: cycles });
            if (result.isSuccess) {
                let obj = JSON.parse(result.message);
                this.contactObj['agenciesWithCodes']['additionalAgencies'] = obj;
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
            }
        } catch (e) {
            console.error(`handleNextFromMissedPopup Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    updateContactObj() {
        try {
            this.contactObj['agenciesWithCodes'] = {
                donationOutcomesListFromApex: this.donationOutcomesListFromApex.map(outcome => ({
                    ...outcome,
                    CityStateOfAgency: outcome.CityStateOfAgency,
                    cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                    selectedCycles: outcome.selectedCycles
                })),
                additionalAgencies: this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    CityStateOfAgency: outcome.CityStateOfAgency,
                    cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                    selectedCycles: outcome.selectedCycles
                })),
                noOtherAgencies: this.noAgencyChecked,
                dontRememberAgencies: this.dontRememberChecked,
                totalSelectedCycles: this.totalSelectedCycles,
                unselectedCycles: this.unselectedCycles
            };
        } catch (e) {

        }
    }

}