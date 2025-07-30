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

    donationOutcomeObject = {
        index: 0,
        agencyHeading: 'Additional Attorneys',
        Name: '',
        LawFirm: '',
        State: '',
        Website: '',
        Phone: '',
        Email: '',
        DonorCode: '',
        showDonorCodeInput: false,
        hideDonorCodeInput: true,
        cycles: [],
        selectedCycles: [],
        headingIndex: 0,
        noAttorneyChecked: false,
        incorrectAttorneyChecked: false,
        primaryConfirmed: false
    };

    get isHideAddAnotherAttorney(){
        return (this.noAttorneyChecked || this.dontRememberChecked);
    }

    async connectedCallback() {
        try {
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj || {}));
            this.totalDonationsCount = this.contactObj.donationBasics.egg.liveBirths;
            const cyclesList = Array(this.totalDonationsCount)
                .fill()
                .map((_, index) => ({
                    index: index,
                    cycleId: `${index + 1}`,
                    cycleName: `Cycle ${index + 1}`,
                    disabled: false,
                    checked: false
                }));

            if (!this.contactObj.isSkipped) {
                let attorneyList = [];
                const attornies = await fetchCodeData({ contactObj: JSON.stringify(this.contactObj) });
                if (attornies.isSuccess) {
                    attorneyList = JSON.parse(attornies.message);
                    const existingAttornies = this.contactObj?.attorneysWithCodes?.donationOutcomesListFromApex || [];
                    this.donationOutcomesListFromApex = attorneyList.map((outcome, index) => {
                        const existing = existingAttornies[index] || {};
                        return {
                            ...outcome,
                            index: index,
                            cycles: existing.cycles || [...cyclesList],
                            selectedCycles: outcome.selectedCycles || [],
                            noAttorneyChecked: outcome.noAttorneyChecked || false,
                            incorrectAttorneyChecked: existing.incorrectAttorneyChecked || false,
                            primaryConfirmed: existing.primaryConfirmed || false,
                            showDonorCodeInput: !!outcome.showDonorCodeInput,
                            hideDonorCodeInput: outcome.hideDonorCodeInput !== undefined ? outcome.hideDonorCodeInput : true
                        }
                    });
                }
            } else {
                this.donationOutcomesListFromApex = [
                    {
                        Name: "Sample Attorney One",
                        LawFirm: "Attorney One Firm",
                        State: "CA",
                        Website: "https://www.attorneyone.org",
                        Phone: "+1 (555) 111-1111",
                        Email: "contact@attorneyone.org",
                        DonorCode: "",
                        showDonorCodeInput: false,
                        hideDonorCodeInput: true,
                        cycles: cyclesList.map(cycle => ({ ...cycle, checked: cycle.cycleId === "1" })),
                        index: 0,
                        noAttorneyChecked: false,
                        incorrectAttorneyChecked: false,
                        primaryConfirmed: false,
                        selectedCycles: ["1"]
                    }
                ];
            }

            const attorniesWithCodes = this.contactObj['attorneysWithCodes'];

            this.donationOutcomes = attorniesWithCodes && attorniesWithCodes.additionalAttorneys?.length > 0
                ? attorniesWithCodes.additionalAttorneys.map((outcome, index) => ({
                    ...outcome,
                    index: index,
                    cycles: outcome.cycles ? outcome.cycles.map(cycle => ({ ...cycle })) : [...cyclesList],
                    selectedCycles: outcome.selectedCycles || [],
                    headingIndex: index + 1,
                    agencyHeading: index === 0 ? 'Additional Attorneys' : ''
                })) : [{
                    ...this.donationOutcomeObject,
                    index: 0,
                    headingIndex: 1,
                    cycles: [...cyclesList]
                }];

            this.noAttorneyChecked = this.contactObj.attorneysWithCodes?.noOtherAttorneys || false;
            this.dontRememberChecked = this.contactObj.attorneysWithCodes?.dontRememberAttorneys || false;
            this.totalSelectedCycles = this.contactObj.attorneysWithCodes?.totalSelectedCycles || [];
            this.unselectedCycles = this.contactObj.attorneysWithCodes?.unselectedCycles || [];
            this.showNumberedHeadings = this.donationOutcomes.length > 1;
            this.intendedParent = this.contactObj.attorneysWithCodes?.intendedParent || { Name: '', Email: '', Phone: '' };
            this.showIntendedParentInput = this.contactObj.attorneysWithCodes?.['showIntendedParentInput'] || false;
            this.hideIntendedParentInput = this.contactObj.attorneysWithCodes?.hideIntendedParentInput !== undefined ? this.contactObj.attorneysWithCodes?.hideIntendedParentInput : true;

            // Initialize totalSelectedCycles from both lists
            this.donationOutcomesListFromApex.forEach(outcome => {
                outcome.cycles.forEach(cycle => {
                    if (cycle.checked && !this.totalSelectedCycles.includes(parseInt(cycle.cycleId))) {
                        this.totalSelectedCycles.push(parseInt(cycle.cycleId));
                    }
                });
            });
            this.donationOutcomes.forEach(outcome => {
                outcome.cycles.forEach(cycle => {
                    if (cycle.checked && !this.totalSelectedCycles.includes(parseInt(cycle.cycleId))) {
                        this.totalSelectedCycles.push(parseInt(cycle.cycleId));
                    }
                });
            });

            // Disable cycles that are already selected
            this.donationOutcomes = this.donationOutcomes.map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({
                    ...cycle,
                    disabled: (cycle.checked) ? false : this.totalSelectedCycles.includes(parseInt(cycle.cycleId))
                }))
            }));
            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({
                    ...cycle,
                    disabled: this.totalSelectedCycles.includes(parseInt(cycle.cycleId)) && !cycle.checked
                }))
            }));
        } catch (e) {
            console.log('error in connectedCallback');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    get noAttorneyOrDontRemember() {
        return this.noAttorneyChecked || this.dontRememberChecked;
    }

    get checkboxStatus() {
        return this.donationOutcomes.length > 1 || this.hasAttorneyDetails() || this.donationOutcomesListFromApex.some(outcome => outcome.primaryConfirmed || outcome.incorrectAttorneyChecked);
    }

    hasAttorneyDetails() {
        return this.donationOutcomes.some(outcome =>
            outcome.Name || outcome.LawFirm || outcome.State || outcome.Website || outcome.Phone || outcome.Email ||
            (outcome.showDonorCodeInput && outcome.DonorCode) ||
            outcome.cycles.some(cycle => cycle.checked)
        );
    }

    get disableAddAnotherAttorney() {
        let clsName = 'textcls addagencycls inputscls';
        if (this.donationOutcomesListFromApex.length + this.donationOutcomes.length >= this.totalDonationsCount || this.noAttorneyOrDontRemember) {
            clsName += ' disableAddAnotherClickCls';
        }
        return clsName;
    }

    handleAddAnotherAttorney() {
        try {
            if (this.donationOutcomesListFromApex.length + this.donationOutcomes.length < this.totalDonationsCount) {
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

                let obj = {
                    ...this.donationOutcomeObject,
                    cycles: newCyclesList,
                    index: this.donationOutcomes.length,
                    headingIndex: this.donationOutcomes.length + 1
                };

                let outcomesRecordsList = [...this.donationOutcomes, obj];
                this.donationOutcomes = outcomesRecordsList.map((outcome, index) => ({
                    ...outcome,
                    index: index,
                    agencyHeading: index === 0 ? 'Additional Attorneys' : '',
                    headingIndex: index + 1
                }));
            } else {
                alert(`Cannot add more attorneys. You have reached the maximum of ${this.totalDonationsCount} attorneys.`);
            }
        } catch (e) {
            console.log('error in handleAddAnotherAttorney');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleDeleteConfirm(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            this.donationOutcomes = this.donationOutcomes.map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({ ...cycle }))
            }));
            const attorney = this.donationOutcomes.find(outcome => outcome.index === index);
            this.deleteIndex = index;
            this.deleteAttorneyNumber = attorney ? attorney.headingIndex : null;
            this.showDeletePopup = true;
        } catch (e) {
            console.log('error in handleDeleteConfirm');
            console.log(e.message);
            console.log(e.stack);
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

            let attorneyId = outcomesList[index].agencyId;
            if (attorneyId) {
                let resultData = await deleteCycleAttorney({ attorneyId: attorneyId });
                console.log('Delete Agency >>> ' + JSON.stringify(resultData));
                if (resultData.isSuccess) {
                    outcomesList.splice(index, 1);
                }
            }
            else {
                outcomesList.splice(index, 1);
            }

            console.log('outcomesList 2 >>> ' + JSON.stringify(outcomesList));

            outcomesList.forEach((outcome, i) => {
                outcome.index = i;
                outcome.headingIndex = i + 1;
                outcome.agencyHeading = i === 0 ? 'Additional Attorneys' : '';
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
            this.deleteAttorneyNumber = null;
        } catch (e) {
            console.log('error in handleDeleteYes');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleDeleteNo() {
        try {
            this.showDeletePopup = false;
            this.deleteIndex = null;
            this.deleteAttorneyNumber = null;
        } catch (e) {
            console.log('error in handleDeleteNo');
            console.log(e.message);
            console.log(e.stack);
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
            this.showInformation = this.totalSelectedCycles.length > 0 && this.noAttorneyOrDontRemember;
        } catch (e) {
            console.log('error in handleCycleChange');
            console.log(e.message);
            console.log(e.stack);
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
                            console.log(`Disabling current cycle [${cycle.cycleId}] due to checkbox checked`);
                            disabled = isChecked;
                        } else if (!isAlreadySelected) {
                            console.log(`Enabling cycle [${cycle.cycleId}] since it's not in selected list`);
                            disabled = false;
                        } else {
                            console.log(`Keeping existing disabled state for cycle [${cycle.cycleId}]: ${cycle.disabled}`);
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
            this.showInformation = this.totalSelectedCycles.length > 0 && this.noAttorneyOrDontRemember;
        } catch (e) {
            console.log('error in handleApexCycleChange');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleNoAttorneyChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome => {
                if (outcome.index === index) {
                    const noAttorneyChecked = event.target.checked;
                    const cycles = outcome.cycles.map(cycle => ({
                        ...cycle,
                        checked: noAttorneyChecked ? false : cycle.checked,
                        disabled: noAttorneyChecked ? true : (this.totalSelectedCycles.includes(parseInt(cycle.cycleId)) && !cycle.checked)
                    }));
                    if (noAttorneyChecked) {
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
                        noAttorneyChecked,
                        incorrectAttorneyChecked: noAttorneyChecked ? false : outcome.incorrectAttorneyChecked,
                        primaryConfirmed: noAttorneyChecked ? false : outcome.primaryConfirmed,
                        Name: noAttorneyChecked ? '' : outcome.Name,
                        LawFirm: noAttorneyChecked ? '' : outcome.LawFirm,
                        State: noAttorneyChecked ? '' : outcome.State,
                        Website: noAttorneyChecked ? '' : outcome.Website,
                        Phone: noAttorneyChecked ? '' : outcome.Phone,
                        Email: noAttorneyChecked ? '' : outcome.Email,
                        DonorCode: noAttorneyChecked ? '' : outcome.DonorCode,
                        showDonorCodeInput: noAttorneyChecked ? false : outcome.showDonorCodeInput,
                        hideDonorCodeInput: noAttorneyChecked ? true : outcome.hideDonorCodeInput,
                        cycles,
                        selectedCycles: noAttorneyChecked ? [] : outcome.selectedCycles
                    };
                }
                return outcome;
            });
            this.showInformation = this.totalSelectedCycles.length > 0 && this.noAttorneyOrDontRemember;
        } catch (e) {
            console.log('error in handleNoAttorneyChange');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleNoAdditionalAttorneyChange(event) {
        try {
            this.noAttorneyChecked = event.target.checked;
            if (this.noAttorneyChecked) {
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
                        this.noAttorneyChecked = false;
                        this.showInformation = true;
                        return;
                    }
                }
                this.showInformation = false;
                this.donationOutcomes = []; /*this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    Name: '',
                    LawFirm: '',
                    State: '',
                    Website: '',
                    Phone: '',
                    Email: '',
                    DonorCode: '',
                    showDonorCodeInput: false,
                    hideDonorCodeInput: true,
                    cycles: outcome.cycles.map(cycle => ({
                        ...cycle,
                        disabled: true,
                        checked: false
                    })),
                    selectedCycles: []
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
                this.showInformation = this.totalSelectedCycles.length > 0 && this.noAttorneyOrDontRemember;
            }
        } catch (e) {
            console.log('error in handleNoAdditionalAttorneyChange');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleDontRememberChange(event) {
        try {
            this.dontRememberChecked = event.target.checked;
            if (this.dontRememberChecked) {
                this.noAttorneyChecked = false;
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
                this.donationOutcomes = []; /*this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    Name: '',
                    LawFirm: '',
                    State: '',
                    Website: '',
                    Phone: '',
                    Email: '',
                    DonorCode: '',
                    showDonorCodeInput: false,
                    hideDonorCodeInput: true,
                    cycles: outcome.cycles.map(cycle => ({
                        ...cycle,
                        disabled: true,
                        checked: false
                    })),
                    selectedCycles: []
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
                this.donationOutcomes = this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    cycles: outcome.cycles.map(cycle => ({
                        ...cycle,
                        disabled: this.totalSelectedCycles.includes(parseInt(cycle.cycleId))
                    }))
                }));
                this.showInformation = this.totalSelectedCycles.length > 0 && this.noAttorneyOrDontRemember;
            }
        } catch (e) {
            console.log('error in handleDontRememberChange');
            console.log(e.message);
            console.log(e.stack);
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
            console.log('error in handleIncorrectAttorneyChange');
            console.log(e.message);
            console.log(e.stack);
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
            console.log('error in handlePrimaryConfirmedChange');
            console.log(e.message);
            console.log(e.stack);
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
            console.log('error in handleApexInputChange');
            console.log(e.message);
            console.log(e.stack);
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
            console.log('error in handleInputChange');
            console.log(e.message);
            console.log(e.stack);
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
            console.log('error in handleApexRadioChange');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleIntendedParentChange(event) {
        try {
            const value = event.target.value;
            this.showIntendedParentInput = value === 'yes';
            this.hideIntendedParentInput = value === 'no';
            if (this.hideIntendedParentInput) {
                this.intendedParent = {
                    Name: '',
                    Email: '',
                    Phone: ''
                };
            }
        } catch (e) {
            console.log('error in handleIntendedParentChange');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleIntendedParentInputChange(event) {
        try {
            const field = event.target.name;
            this.intendedParent = {
                ...this.intendedParent,
                [field]: event.target.value
            };
            const input = event.target;
            if (input.validity.valid) {
                input.setCustomValidity('');
                input.reportValidity();
            }
        } catch (e) {
            console.log('error in handleIntendedParentInputChange');
            console.log(e.message);
            console.log(e.stack);
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

            if (fieldsMap.has(fieldName) && !this.noAttorneyOrDontRemember) {
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
            console.log('error in handleInputBlur');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleEggAttorneyWithEDNBack() {
        try {
            this.updateContactObj();
            this.dispatchEvent(new CustomEvent('back', {
                detail: this.contactObj
            }));
        } catch (e) {
            console.log('error in handleEggAttorneyWithEDNBack');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    async handleEggAttorneyWithEDNNext() {
        try {
            this.showInformation = false;
            if (this.noAttorneyOrDontRemember) {
                let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
                if (cycleCheckboxclsList.length > 0) {
                    let anyChecked = false;
                    cycleCheckboxclsList.forEach(cycle => {
                        if (cycle.checked) {
                            anyChecked = true;
                        }
                    });
                    if (anyChecked) {
                        this.contactObj['attorneysWithCodes'] = {
                            donationOutcomesListFromApex: this.donationOutcomesListFromApex.map(outcome => ({
                                ...outcome,
                                cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                                selectedCycles: outcome.selectedCycles
                            }))
                        }
                        let existingAttornies = JSON.stringify(this.contactObj['attorneysWithCodes']['donationOutcomesListFromApex']);
                        let addedAttornies = JSON.stringify([])
                        let cycles = JSON.stringify(this.contactObj['allCycles']);
                        let result = await updateEggAttorniesWithCodes({ existingAttornies: existingAttornies, addedAttornies: addedAttornies, cycles: cycles });
                        console.log('Result >>> ' + JSON.stringify(result));
                        if (result.isSuccess) {
                            let obj = JSON.parse(result.message)
                            console.log('Result >>> ' + JSON.stringify(obj));
                            this.contactObj['attorneysWithCodes']['additionalAttorneys'] = obj;
                            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                        }
                        //  this.showInformation = true;
                        //  return;
                    }
                }
                this.updateContactObj();
                this.dispatchEvent(new CustomEvent('next', {
                    detail: this.contactObj
                }));
                return;
            }

            const fieldsMap = new Map([
                ['Name', 'Please enter attorney name'],
                ['Website', 'Please enter website'],
                ['Phone', 'Please enter phone number'],
                ['Email', 'Please enter email'],
                ['State', 'Please enter state'],
                ['DonorCode', 'Please enter donor code'],
                ['Name', 'Please enter intended parent name']
            ]);

            let isValid = true;
            this.template.querySelectorAll('lightning-input[data-index], lightning-input[name="Name"], lightning-input[name="Email"], lightning-input[name="Phone"]').forEach(input => {
                const fieldName = input.name;
                const value = input.value;
                if (['Name', 'Email', 'Phone'].includes(fieldName)) {
                    if (this.showIntendedParentInput && fieldName === 'Name' && value === '') {
                        input.setCustomValidity(fieldsMap.get(fieldName));
                        input.reportValidity();
                        isValid = false;
                    } else {
                        input.setCustomValidity('');
                        input.reportValidity();
                    }
                } else {
                    const outcome = this.donationOutcomesListFromApex.find(o => o.index === parseInt(input.dataset.index)) ||
                        this.donationOutcomes.find(o => o.index === parseInt(input.dataset.index));
                    if (!outcome || (outcome && !outcome.noAttorneyChecked)) {
                        if (fieldName === 'DonorCode' && value === '' && outcome?.showDonorCodeInput) {
                            input.setCustomValidity(fieldsMap.get(fieldName));
                            input.reportValidity();
                            isValid = false;
                        } else if (fieldName !== 'DonorCode' && fieldName !== 'LawFirm' && value === '' && fieldName == 'Name') {
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
                if (!outcome.noAttorneyChecked && !outcome.primaryConfirmed && !outcome.incorrectAttorneyChecked) {
                    allConfirmed = false;
                }
            });

            if (!allConfirmed) {
                alert('Please confirm the status of each attorney (correct, incorrect, or did not work with) before proceeding.');
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
                this.handleAttorneyMissedCycles(true);
            } else {
                this.updateContactObj();
                let existingAttornies = JSON.stringify(this.contactObj['attorneysWithCodes']['donationOutcomesListFromApex']);
                let addedAttornies = JSON.stringify(this.contactObj['attorneysWithCodes']['additionalAttorneys'])
                let cycles = JSON.stringify(this.contactObj['allCycles']);
                let result = await updateEggAttorniesWithCodes({ existingAttornies: existingAttornies, addedAttornies: addedAttornies, cycles: cycles });
                console.log('Result >>> ' + JSON.stringify(result));
                if (result.isSuccess) {
                    let obj = JSON.parse(result.message)
                    console.log('Result >>> ' + JSON.stringify(obj));
                    this.contactObj['attorneysWithCodes']['additionalAttorneys'] = obj;
                    this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                }
                console.log('this.contactObj >>> ' + JSON.stringify(this.contactObj));
            }
        } catch (e) {
            console.log('error in handleEggAttorneyWithEDNNext');
            console.log(e.message);
            console.log(e.stack);
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
            console.log('error in handleAttorneyMissedCycles');
            console.log(e.message);
            console.log(e.stack);
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
            console.log('error')
            console.log(e.message)
            confirm.log(e.stack)
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
            console.log('error in handleBackFromMissedPopup');
            console.log(e.message);
            console.log(e.stack);
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
            let existingAttornies = JSON.stringify(this.contactObj['attorneysWithCodes']['donationOutcomesListFromApex']);
            let addedAttornies = JSON.stringify(this.contactObj['attorneysWithCodes']['additionalAttorneys'])
            let cycles = JSON.stringify(this.contactObj['allCycles']);
            let result = await updateEggattorneysWithCodes({ existingAttornies: existingAttornies, addedAttornies: addedAttornies, cycles: cycles });
            console.log('Result >>> ' + JSON.stringify(result));
            if (result.isSuccess) {
                let obj = JSON.parse(result.message);
                console.log('Result >>> ' + JSON.stringify(obj));
                this.contactObj['attorneysWithCodes']['additionalAttorneys'] = obj;
                this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
            }
            console.log('this.contactObj >>> ' + JSON.stringify(this.contactObj));
        } catch (e) {
            console.log('error in handleNextFromMissedPopup');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    get showNextFromMissedPopupButton() {
        return this.unselectedCycles.length > 0 &&
            this.unselectedCycles.every(cycle => cycle.confirmedNo || cycle.selectedYes);
    }

    updateContactObj() {
        try {
            console.log('this.contactObj Before >>> '+JSON.stringify(this.contactObj));
            this.contactObj['attorneysWithCodes'] = {
                donationOutcomesListFromApex: this.donationOutcomesListFromApex.map(outcome => ({
                    ...outcome,
                    cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                    selectedCycles: outcome.selectedCycles
                })),
                additionalAttorneys: this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                    selectedCycles: outcome.selectedCycles
                })),
                noOtherAttorneys: this.noAttorneyChecked,
                dontRememberAttorneys: this.dontRememberChecked,
                totalSelectedCycles: this.totalSelectedCycles,
                unselectedCycles: this.unselectedCycles,
                intendedParent: { ...this.intendedParent },
                showIntendedParentInput: this.showIntendedParentInput,
                hideIntendedParentInput: this.hideIntendedParentInput
            };
            console.log('this.contactObjBefore After >>> '+JSON.stringify(this.contactObj));
        } catch (e) {
            console.log('error in updateContactObj');
            console.log(e.message);
            console.log(e.stack);
        }
    }
}