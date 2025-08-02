import { LightningElement, track, api } from 'lwc';
import fetchCodeData from '@salesforce/apex/EggDonorAgencyWithCodeController.fetchCodeData';
import updateEggAgenciesWithCodes from '@salesforce/apex/EggDonorAgencyWithCodeController.updateEggAgenciesWithCodes';
import createCoordinator from '@salesforce/apex/UtilityClass.createCoordinator';
import deleteCoordinator from '@salesforce/apex/UtilityClass.deleteCoordinator';


export default class DonorPreRegEggAgencyWithEDN extends LightningElement {

    @api totalDonationsCount;
    @api contactObj;
    @track donationOutcomes = [];
    @track donationOutcomesListFromApex = [];
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
    @track openCoordinator = false;

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
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
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
                            showDonorCodeInput: !!existing.showDonorCodeInput,
                            hideDonorCodeInput: existing.hideDonorCodeInput ?? true,
                            CoordinatorName: existing.CoordinatorName || '',
                            PMC: outcome.PMC,
                            disableAddIcon : existing.disableAddIcon || true,
                            Coordinator: outcome.Coordinator || { lastName: '', firstName: '', phone: '', parentId: outcome.agencyId, coordinatorId: '' },
                            openCoordinator: outcome.openCoordinator || false
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

            this.totalSelectedCycles = [...selectedCycleSet];
            this.unselectedCycles = agenciesWithCodes.unselectedCycles || [];

            console.log('donationOutcomesListFromApex >>> ' + JSON.stringify(this.donationOutcomesListFromApex));

        } catch (e) {
            console.error(`connectedCallback Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    async handleCreateCoordinator(event) {
        let isValid = true;
        let index = parseInt(event.currentTarget.dataset.index);

        for (let input of this.template.querySelectorAll('.CoordinatorClass')) {
            const validations = {
                lastName: () => !input.value.trim() && 'Last Name is required',
                phone: () => input.value && !input.checkValidity() && 'Enter a valid phone number with country code, e.g: +911234567890.'
            };
            const errorMsg = validations[input.name]?.() || '';
            input.setCustomValidity(errorMsg);
            input.reportValidity();
            if (errorMsg) {
                isValid = false;
                break;
            }
        }

        if (isValid) {
            let result = await createCoordinator({ coordinateData: JSON.stringify(this.donationOutcomesListFromApex[index].Coordinator) });
            if (result.isSuccess) {
                console.log('Result createCoordinator >>> ' + result.message);
                let coordinatorRecord = JSON.parse(result.message);
                if (this.donationOutcomesListFromApex[index]['CoordinatorName']) {
                    let res = await deleteCoordinator({ coordinatorId: this.donationOutcomesListFromApex[index]['CoordinatorName'] });
                    console.log('Result deleteCoordinator >>> ' + JSON.stringify(res));
                }
                this.donationOutcomesListFromApex[index]['CoordinatorName'] = coordinatorRecord.coordinatorId;
                this.donationOutcomesListFromApex[index]['Coordinator']['coordinatorId'] = coordinatorRecord.coordinatorId;
                this.donationOutcomesListFromApex[index]['openCoordinator'] = false;
            } else {
                console.log('Result Fail >>> ' + JSON.stringify(result));
            }
        }
    }


    handleAddIcon(event){
        let index = parseInt(event.target.dataset.index, 10);
        this.donationOutcomesListFromApex[index]['disableAddIcon'] = event.detail;
    }


    handleCoordinatorChange(event) {
        let { name, dataset, value } = event.currentTarget;
        this.donationOutcomesListFromApex[parseInt(dataset.index)].Coordinator[name] = value;
    }


    handleOpenCreateCoordinator(event) {
        try {
            let index = parseInt(event.target.dataset.index);
            this.donationOutcomesListFromApex[index].openCoordinator = !this.donationOutcomesListFromApex[index].openCoordinator;
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
                        incorrectAgencyChecked: field === 'incorrectAgencyChecked',
                        noAgencyChecked: field === 'incorrectAgencyChecked'
                    }
                    : outcome
            );
        } catch (e) {
            console.error(`handleRadioChange Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
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
                ['Name', 'Please enter agency name'],
                ['Website', 'Please enter website'],
                ['Phone', 'Please enter phone number'],
                ['Email', 'Please enter email'],
                ['CoordinatorName', 'Please enter coordinator name'],
                ['DonorCode', 'Please enter donor code']
            ]);

            if (fieldsMap.has(fieldName)) {
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


    handleValueSelectedOnAccount(event) {
        if (event.detail) {
            let index = parseInt(event.target.dataset.index, 10);
            this.donationOutcomesListFromApex[index].CoordinatorName = event.detail.id;
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
                let param = {
                    donorId: this.contactObj.donorId,
                    agencyData: JSON.stringify(this.contactObj.agenciesWithCodes.donationOutcomesListFromApex)
                }
                let result = await updateEggAgenciesWithCodes(param);
                console.log('Result updateEggAgenciesWithCodes >>> ' + JSON.stringify(result));
                if (result.isSuccess) {
                    this.dispatchEvent(new CustomEvent('next', {
                        detail: this.contactObj
                    }));
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
            console.log('this.contactObj 3 >>> ' + JSON.stringify(this.contactObj));
        } catch (e) {
            console.error(`handleNextFromMissedPopup Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    updateContactObj() {
        try {
            this.contactObj['agenciesWithCodes'] = {
                donationOutcomesListFromApex: this.donationOutcomesListFromApex.map(outcome => ({
                    ...outcome,
                    cycles: outcome.cycles.map(cycle => ({ ...cycle })),
                    selectedCycles: outcome.selectedCycles
                })),
                totalSelectedCycles: this.totalSelectedCycles,
                unselectedCycles: this.unselectedCycles
            };
            console.log('this.contactObj 1 >>> ' + JSON.stringify(this.contactObj));
        } catch (e) {
            console.error(`updateContactObj Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }

}