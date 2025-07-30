import { LightningElement, track, api } from 'lwc';
import updateEggClinicsWithCodes from '@salesforce/apex/EggDonorClinicWithCodeController.updateEggClinicsWithCodes';
import fetchCodeData from '@salesforce/apex/EggDonorClinicWithCodeController.fetchCodeData';
import deleteCycleClinic from '@salesforce/apex/EggDonorClinicWithCodeController.deleteCycleClinic'

export default class DonorPreRegEggClinicWithEDN extends LightningElement {
    //@track warningIcon = WARNING_ICON_LOGO;
    @track totalDonationsCount = 5;
    @track donationOutcomes = [];
    @track donationOutcomesListFromApex = [];
    @track noClinicChecked = false;
    @track dontRememberChecked = false;
    @track showNumberedHeadings = false;
    @track showDeletePopup = false;
    @track deleteClinicNumber = null;
    @track deleteIndex = null;
    @track showInformation = false;
    @track unselectedCycles = [];
    @track showMissedCycles = false;
    @track showMissedPopupBackButton = false;
    @track unselectedCyclesFilterList = [];
    @track notIntrestedForClinicCyclesList = [];
    @track totalSelectedCycles = [];
    @api donationBasicsInfo;
    @api contactObj;

    donationOutcomeObject = {
        index: 0,
        clinicHeading: 'Additional Clinics',
        Name: '',
        DoctorName: '',
        Website: '',
        CityState: '',
        Phone: '',
        Email: '',
        CoordinatorName: '',
        DonorCode: '',
        showDonorCodeInput: false,
        hideDonorCodeInput: true,
        cycles: [],
        selectedCycles: [],
        headingIndex: 0,
        noClinicChecked: false,
        incorrectClinicChecked: false,
        primaryConfirmed: false
    };

    get isHideAddAnotherClinic(){
        return (this.noClinicChecked || this.dontRememberChecked);
    }

    async connectedCallback() {
        try {
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
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
            console.log('This.contactObject >>> '+JSON.stringify(this.contactObj))
            if (!this.contactObj.isSkipped) {
                let clinicList = [];
                const clinics = await fetchCodeData({ contactObj: JSON.stringify(this.contactObj) });
                console.log('Clinics 1>>> ' + JSON.stringify(clinics));
                if (clinics.isSuccess) {
                    clinicList = JSON.parse(clinics.message);
                    const existingClinics = this.contactObj?.clinicsWithCodes?.donationOutcomesListFromApex || [];
                    this.donationOutcomesListFromApex = clinicList.map((outcome, index) => {
                        const existing = existingClinics[index] || {};
                        return {
                            ...outcome,
                            index: index,
                            cycles: existing.cycles || [...cyclesList],
                            selectedCycles: outcome.selectedCycles || [],
                            noClinicChecked: outcome.noClinicChecked || false,
                            incorrectClinicChecked: existing.incorrectClinicChecked || false,
                            primaryConfirmed: existing.primaryConfirmed || false,
                            showDonorCodeInput: outcome.showDonorCodeInput || false,
                            hideDonorCodeInput: outcome.hideDonorCodeInput !== undefined ? outcome.hideDonorCodeInput : true
                        };
                    });
                }
            } else {
                this.donationOutcomesListFromApex = [
                    {
                        Name: "Helping Hands Clinic",
                        Website: "https://www.helpinghandsclinic.org",
                        Phone: "+1 (555) 222-2222",
                        Email: "support@helpinghandsclinic.org",
                        CoordinatorName: "Bob Johnson",
                        DonorCode: "",
                        showDonorCodeInput: false,
                        hideDonorCodeInput: false,
                        cycles: cyclesList.map(cycle => ({ ...cycle, checked: cycle.cycleId === "2" })),
                        index: 1,
                        noClinicChecked: false,
                        incorrectClinicChecked: false,
                        primaryConfirmed: false,
                        selectedCycles: ["2"]
                    }
                ];
            }

            const clinicsWithCodes = this.contactObj['clinicsWithCodes'];
            console.log('clinicsWithCodes >>> '+clinicsWithCodes);
            this.donationOutcomes = clinicsWithCodes && clinicsWithCodes.additionalClinics && clinicsWithCodes.additionalClinics?.length > 0
                ? clinicsWithCodes.additionalClinics.map((outcome, index) => ({
                    ...outcome,
                    index,
                    headingIndex: index + 1,
                    clinicHeading: index === 0 ? 'Additional Clinics' : '',
                    cycles: outcome.cycles?.map(cycle => ({ ...cycle })) || [...cyclesList],
                    selectedCycles: outcome.selectedCycles || [],
                    showDonorCodeInput: !!outcome.showDonorCodeInput,
                    hideDonorCodeInput: outcome.hideDonorCodeInput !== undefined
                        ? outcome.hideDonorCodeInput
                        : true,
                    CityStateOfClinic: outcome.CityStateOfClinic || ''
                }))
                : [{
                    ...this.donationOutcomeObject,
                    index: 0,
                    headingIndex: 1,
                    cycles: [...cyclesList]
                }];
            console.log('this.donationOutcomes >>> '+JSON.stringify(this.donationOutcomes));
            this.noClinicChecked = this.contactObj?.clinicsWithCodes?.noOtherClinics || false;
            this.dontRememberChecked = this.contactObj?.clinicsWithCodes?.dontRememberClinics || false;
            this.totalSelectedCycles = this.contactObj?.clinicsWithCodes?.totalSelectedCycles || [];
            this.unselectedCycles = this.contactObj?.clinicsWithCodes?.unselectedCycles || [];
            this.showNumberedHeadings = this.donationOutcomes.length > 1;

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

    get noClinicOrDontRemember() {
        return this.noClinicChecked || this.dontRememberChecked;
    }

    get checkboxStatus() {
        return this.donationOutcomes.length > 1 || this.hasClinicDetails() || this.donationOutcomesListFromApex.some(outcome => outcome.primaryConfirmed || outcome.incorrectClinicChecked);
    }

    hasClinicDetails() {
        return this.donationOutcomes.some(outcome =>
            outcome.Name || outcome.DoctorName || outcome.Website || outcome.CityState ||
            outcome.Phone || outcome.Email || outcome.CoordinatorName ||
            (outcome.showDonorCodeInput && outcome.DonorCode) ||
            outcome.cycles.some(cycle => cycle.checked)
        );
    }

    handleAddAnotherClinic() {
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
                    clinicHeading: index === 0 ? 'Additional Clinics' : '',
                    headingIndex: index + 1
                }));
            } else {
                alert(`Cannot add more clinics. You have reached the maximum of ${this.totalDonationsCount} clinics.`);
            }
        } catch (e) {
            console.log('error in handleAddAnotherClinic');
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
            const clinic = this.donationOutcomes.find(outcome => outcome.index === index);
            this.deleteIndex = index;
            this.deleteClinicNumber = clinic ? clinic.headingIndex : null;
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

            console.log('Deleted one >>> ' + JSON.stringify(outcomesList[index]))
            let clinicId = outcomesList[index].clinicId;
            console.log('clinicId >>> ' + clinicId);
            if (clinicId) {
                let resultData = await deleteCycleClinic({ clinicId: clinicId });
                console.log('Delete Agency >>> ' + JSON.stringify(resultData));
                if (resultData.isSuccess) {
                    outcomesList.splice(index, 1);
                }
            }
            else{
                outcomesList.splice(index, 1);
            }
            console.log('outcomesList 2 >>> ' + JSON.stringify(outcomesList));

            outcomesList.forEach((outcome, i) => {
                outcome.index = i;
                outcome.headingIndex = i + 1;
                outcome.clinicHeading = i === 0 ? 'Additional Clinics' : '';
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
            this.deleteClinicNumber = null;
        } catch (e) {
            console.log('error in handleDeleteYes');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteClinicNumber = null;
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

            // Update Apex list to disable cycles
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
            this.showInformation = this.totalSelectedCycles.length > 0 && this.noClinicOrDontRemember;
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

            // Update non-Apex list to disable cycles
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
            this.showInformation = this.totalSelectedCycles.length > 0 && this.noClinicOrDontRemember;
        } catch (e) {
            console.log('error in handleApexCycleChange');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    get disableAddAnotherClinic() {
        let clsName = 'textcls addagencycls inputscls';
        if (this.donationOutcomesListFromApex.length + this.donationOutcomes.length >= this.totalDonationsCount || this.noClinicOrDontRemember) {
            clsName += ' disableAddAnotherClickCls';
        }
        return clsName;
    }


    handleNoClinicChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome => {
                if (outcome.index === index) {
                    const noClinicChecked = event.target.checked;
                    const cycles = outcome.cycles.map(cycle => ({
                        ...cycle,
                        checked: noClinicChecked ? false : cycle.checked,
                        disabled: noClinicChecked ? true : (this.totalSelectedCycles.includes(parseInt(cycle.cycleId)) && !cycle.checked)
                    }));
                    if (noClinicChecked) {
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
                        noClinicChecked,
                        incorrectClinicChecked: noClinicChecked ? false : outcome.incorrectClinicChecked,
                        primaryConfirmed: noClinicChecked ? false : outcome.primaryConfirmed,
                        Name: noClinicChecked ? '' : outcome.Name,
                        Website: noClinicChecked ? '' : outcome.Website,
                        Phone: noClinicChecked ? '' : outcome.Phone,
                        Email: noClinicChecked ? '' : outcome.Email,
                        CoordinatorName: noClinicChecked ? '' : outcome.CoordinatorName,
                        DonorCode: noClinicChecked ? '' : outcome.DonorCode,
                        showDonorCodeInput: noClinicChecked ? false : outcome.showDonorCodeInput,
                        hideDonorCodeInput: noClinicChecked ? true : outcome.hideDonorCodeInput,
                        cycles,
                        selectedCycles: noClinicChecked ? [] : outcome.selectedCycles
                    };
                }
                return outcome;
            });
            this.showInformation = this.totalSelectedCycles.length > 0 && this.noClinicOrDontRemember;
        } catch (e) {
            console.log('error in handleNoClinicChange');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleNoAdditionalClinicChange(event) {
        try {
            this.noClinicChecked = event.target.checked;
            if (this.noClinicChecked) {
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
                        this.noClinicChecked = false;
                        this.showInformation = true;
                        return;
                    }
                }
                this.showInformation = false;
                this.donationOutcomes = [];/*this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    Name: '',
                    DoctorName: '',
                    Website: '',
                    CityState: '',
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
                    selectedCycles: []
                }));*/
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
                this.showInformation = this.totalSelectedCycles.length > 0 && this.noClinicOrDontRemember;
            }
        } catch (e) {
            console.log('error in handleNoAdditionalClinicChange');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleDontRememberChange(event) {
        try {
            this.dontRememberChecked = event.target.checked;
            if (this.dontRememberChecked) {
                this.noClinicChecked = false;
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
                this.donationOutcomes = [];/*this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    Name: '',
                    DoctorName: '',
                    Website: '',
                    CityState: '',
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
                this.showInformation = this.totalSelectedCycles.length > 0 && this.noClinicOrDontRemember;
            }
        } catch (e) {
            console.log('error in handleDontRememberChange');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleIncorrectClinicChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            this.donationOutcomesListFromApex = this.donationOutcomesListFromApex.map(outcome =>
                outcome.index === index
                    ? {
                        ...outcome,
                        incorrectClinicChecked: event.target.checked,
                        noClinicChecked: event.target.checked ? true : false,
                        primaryConfirmed: event.target.checked ? false : outcome.primaryConfirmed
                    }
                    : outcome
            );
        } catch (e) {
            console.log('error in handleIncorrectClinicChange');
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
                        incorrectClinicChecked: event.target.checked ? false : outcome.incorrectClinicChecked,
                        noClinicChecked: event.target.checked ? false : outcome.noClinicChecked
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

    handleRadioChange(event) {
        try {
            const index = parseInt(event.target.dataset.index, 10);
            const value = event.target.value;
            this.donationOutcomes = this.donationOutcomes.map(outcome =>
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
            console.log('error in handleRadioChange');
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
                ['Name', 'Please enter clinic name'],
                ['DoctorName', 'Please enter doctor name'],
                ['Website', 'Please enter website'],
                ['CityState', 'Please enter city/state'],
                ['Phone', 'Please enter phone number'],
                ['Email', 'Please enter email'],
                ['CoordinatorName', 'Please enter coordinator/nurse name'],
                ['DonorCode', 'Please enter donor code']
            ]);

            if (fieldsMap.has(fieldName) && !this.noClinicOrDontRemember) {
                const outcome = this.donationOutcomesListFromApex.find(o => o.index === parseInt(input.dataset.index)) ||
                    this.donationOutcomes.find(o => o.index === parseInt(input.dataset.index));
                if (outcome && !outcome.noClinicChecked) {
                    if (fieldName === 'DonorCode' && value === '' && outcome.showDonorCodeInput) {
                        input.setCustomValidity(fieldsMap.get(fieldName));
                    } else if (fieldName !== 'DonorCode' && fieldName !== 'CoordinatorName' && fieldName !== 'DoctorName' && value === '') {
                        input.setCustomValidity(fieldsMap.get(fieldName));
                    } else {
                        input.setCustomValidity('');
                    }
                    input.reportValidity();
                }
            }
        } catch (e) {
            console.log('error in handleInputBlur');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleEggClinicWithEDNBack() {
        try {
            this.updateContactObj();
            this.dispatchEvent(new CustomEvent('back', {
                detail: this.contactObj
            }));
        } catch (e) {
            console.log('error in handleEggClinicWithEDNBack');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    async handleEggClinicWithEDNNext() {
        try {
            this.showInformation = false;
            if (this.noClinicOrDontRemember) {
                let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
                if (cycleCheckboxclsList.length > 0) {
                    let anyChecked = false;
                    cycleCheckboxclsList.forEach(cycle => {
                        if (cycle.checked) {
                            anyChecked = true;
                        }
                    });
                    if (anyChecked) {
                        this.contactObj['clinicsWithCodes'] = {
                            donationOutcomesListFromApex: this.donationOutcomesListFromApex.map(outcome => ({
                                ...outcome,
                                CityStateOfClinic: outcome.CityState, // Backward compatibility
                                cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                                selectedCycles: outcome.selectedCycles
                            }))
                        }
                        let existingClinics = JSON.stringify(this.contactObj['clinicsWithCodes']['donationOutcomesListFromApex']);
                        let addedClinics = JSON.stringify([]);
                        let cycles = JSON.stringify(this.contactObj['allCycles']);
                        let result = await updateEggClinicsWithCodes({ existingClinics: existingClinics, addedClinics: addedClinics, cycles: cycles });
                        console.log('Result >>> ' + JSON.stringify(result));
                        if (result.isSuccess) {
                            let obj = JSON.parse(result.message);
                            console.log('Result >>> ' + JSON.stringify(obj));
                            this.contactObj['clinicsWithCodes']['additionalClinics'] = obj;
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
                ['Name', 'Please enter clinic name'],
                ['Website', 'Please enter website'],
                ['Phone', 'Please enter phone number'],
                ['Email', 'Please enter email'],
                ['CoordinatorName', 'Please enter coordinator/nurse name'],
                ['DonorCode', 'Please enter donor code']
            ]);
            let isValid = true;
            this.template.querySelectorAll('lightning-input[data-index]').forEach(input => {
                if (input.type != 'checkbox') {
                    const fieldName = input.name;
                    const value = input.value;
                    const outcome = this.donationOutcomesListFromApex.find(o => o.index === parseInt(input.dataset.index)) ||
                        this.donationOutcomes.find(o => o.index === parseInt(input.dataset.index));
                    if (!outcome || (outcome && !outcome.noClinicChecked)) {
                        if (fieldName === 'DonorCode' && value === '' && outcome?.showDonorCodeInput) {
                            input.setCustomValidity(fieldsMap.get(fieldName));
                            input.reportValidity();
                            isValid = false;
                        } else if (fieldName !== 'DonorCode' && fieldName !== 'CoordinatorName' && fieldName !== 'DoctorName' && value === '' && fieldName === 'Name') {
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
            // Validate Apex-sourced clinics
            let allConfirmed = true;
            this.donationOutcomesListFromApex.forEach(outcome => {
                if (!outcome.noClinicChecked && !outcome.primaryConfirmed && !outcome.incorrectClinicChecked) {
                    allConfirmed = false;
                }
            });
            if (!allConfirmed) {
                alert('Please confirm the status of each clinic (correct, incorrect, or did not work with) before proceeding.');
                return;
            }
            // Check for unselected cycles
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
                let existingClinics = JSON.stringify(this.contactObj['clinicsWithCodes']['donationOutcomesListFromApex']);
                let addedClinics = JSON.stringify(this.contactObj['clinicsWithCodes']['additionalClinics'])
                let cycles = JSON.stringify(this.contactObj['allCycles']);
                let result = await updateEggClinicsWithCodes({ existingClinics: existingClinics, addedClinics: addedClinics, cycles: cycles });
                console.log('Result >>> ' + JSON.stringify(result));
                if (result.isSuccess) {
                    let obj = JSON.parse(result.message);
                    console.log('Result >>> ' + JSON.stringify(obj));
                    this.contactObj['clinicsWithCodes']['additionalClinics'] = obj;
                    this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                }
                console.log('this.contactObj >>> ' + JSON.stringify(this.contactObj));
            }
        } catch (e) {
            console.log('Error in handleEggClinicWithEDNNext >>> ' + e.message + ' **** ' + e.stack);
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
                this.notIntrestedForClinicCyclesList = [];
            }
        } catch (e) {
            console.log('error in handleAgencyMissedCycles');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleMissedCycleYesClick(event) {
        try {
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

            this.notIntrestedForClinicCyclesList = [];//this.unselectedCycles.filter(cycle => cycle.selectedYes || cycle.confirmedNo);
            this.showMissedPopupBackButton = true;//this.unselectedCycles.some(cycle => cycle.selectedYes);
            // this.showMissedCycles = this.unselectedCycles.some(cycle => !cycle.confirmedNo && !cycle.selectedYes);
        } catch (e) {
            console.log('error in handleMissedCycleYesClick');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleMissedCycleNoClick(event) {
        try {
            let cyclename = event.target.dataset.cyclename;
            let cycleId = parseInt(event.target.dataset.cycle, 10);

            this.unselectedCycles = this.unselectedCycles.map(cycle => {
                let obj = { ...cycle }
                if (cycle['cycledId'] == cycleId) {
                    obj['selectedYes'] = true;
                }
                return obj;
            });

            this.notIntrestedForClinicCyclesList = this.unselectedCycles.filter(cycle => cycle.selectedYes == true);
            this.showMissedPopupBackButton = false;//this.unselectedCycles.some(cycle => cycle.selectedYes);
            //  this.showMissedCycles = this.unselectedCycles.some(cycle => !cycle.confirmedNo && !cycle.selectedYes);
        } catch (e) {
            console.log('error in handleMissedCycleNoClick');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleBackFromMissedPopup() {
        try {
            this.unselectedCycles = this.unselectedCycles.filter(cycle => cycle.confirmedNo);
            this.unselectedCyclesFilterList = [];
            this.notIntrestedForClinicCyclesList = [];
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
            this.notIntrestedForClinicCyclesList = [];
            this.updateContactObj();
            let existingClinics = JSON.stringify(this.contactObj['clinicsWithCodes']['donationOutcomesListFromApex']);
            let addedClinics = JSON.stringify(this.contactObj['clinicsWithCodes']['additionalClinics'])
            let cycles = JSON.stringify(this.contactObj['allCycles']);
            let result = await updateEggClinicsWithCodes({ existingClinics: existingClinics, addedClinics: addedClinics, cycles: cycles });
            console.log('Result >>> ' + JSON.stringify(result));
            if (result.isSuccess) {
                let obj = JSON.parse(result.message);
                console.log('Result >>> ' + JSON.stringify(obj));
                this.contactObj['clinicsWithCodes']['additionalClinics'] = obj;
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
            this.contactObj['clinicsWithCodes'] = {
                donationOutcomesListFromApex: this.donationOutcomesListFromApex.map(outcome => ({
                    ...outcome,
                    CityStateOfClinic: outcome.CityState, // Backward compatibility
                    cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                    selectedCycles: outcome.selectedCycles
                })),
                additionalClinics: this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                    selectedCycles: outcome.selectedCycles
                })),
                noOtherClinics: this.noClinicChecked,
                dontRememberClinics: this.dontRememberChecked,
                totalSelectedCycles: this.totalSelectedCycles,
                unselectedCycles: this.unselectedCycles
            };
        } catch (e) {

        }
    }

    get disablePopupBackBtn() {
        return this.showMissedPopupBackButton ? 'popupBackBtnCls' : 'popupBackBtnDisable';
    }

    get disablePopupNextBtn() {
        return this.showNextFromMissedPopupButton ? 'popupBackBtnCls' : 'popupNextBtnDisable';
    }
}