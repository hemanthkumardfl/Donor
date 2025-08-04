import { LightningElement, track, api } from 'lwc';
import deleteCycleAgency from '@salesforce/apex/EggDonorAgencyWithCodeController.deleteCycleAgency'; getRecord
import getRecord from '@salesforce/apex/EggDonorAgencyWithCodeController.getRecord';
import createCoordinator from '@salesforce/apex/UtilityClass.createCoordinator';


export default class DonorPreRegEggDonorAgency extends LightningElement {
    @track totalDonationsCount;
    @track donationOutcomes = [];
    @track noAgencyChecked = false;
    @track showNumberedHeadings = false;
    @track showPopup = false;
    @track showBackButton = false;
    @track totalSelectedCycles = [];
    @track showDeletePopup = false;
    @track deleteIndex = null;
    @track deleteAgencyNumber = null;
    @api donationBasicsInfo;
    @api eggDonorAgencyUserInput;
    @track showInformation = false;
    @track clsNamestring = null;
    @api contactObj;

    /** missed agencyclinic modal popup related variables **/
    @track unselectedCycles = [];
    @track showMissedCycles = false; //this variable controlls missed agency cycles popup model.
    @track showMissedPopupBackButton = false; //this vaiable conditionally displays button 
    @track unselectedCyclesFilterList = []; // this variable holds back selected list
    @track notIntrestedForAgencyCyclesList = []; //this variable holds the not intrested list
    /** missed agencyclinic modal popup related variables ends here**/

    donationOutcomeObject = {
        index: 0,
        agencyHeading: '',
        AgencyName: '',
        Website: '',
        Phone: '',
        Email: '',
        CoordinatorName: '',
        cycles: [],
        selectedCycles: [],
        headingIndex: 0,
        agencyId: '',
        isDisabled: false,
        disableAddIcon: true,
        disableContactAddIcon: true,
        Coordinator: { lastName: '', firstName: '', phone: '', parentId: '', coordinatorId: '' },
        openCoordinator: false
    };

    get showAddAnother() {
        return (this.donationOutcomes.length < this.totalDonationsCount);
    }


    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        this.totalDonationsCount = this.contactObj.donationBasics.egg.liveBirths;
        if (this.contactObj && this.contactObj['agenciesWithoutCode'] && this.contactObj['agenciesWithoutCode'].length > 0) {
            console.log('Connected Call >>> '+JSON.stringify(this.contactObj['agenciesWithoutCode']));
            this.donationOutcomes = this.contactObj['agenciesWithoutCode'].map(outcome => ({
                ...outcome,
                cycles: outcome.cycles.map(cycle => ({
                    ...cycle,
                    disabled: cycle.checked ? false : cycle.disabled
                }))
            }));

            if (this.donationOutcomes[0]['totalSelectedCycles'] && this.donationOutcomes[0]['totalSelectedCycles'].length > 0) {
                this.totalSelectedCycles = [... this.donationOutcomes[0]['totalSelectedCycles']];

                this.totalSelectedCycles = [...new Set(
                    this.totalSelectedCycles.filter(item => typeof item !== 'object' || Object.keys(item).length > 0)
                )];
            }

            if (this.donationOutcomes[0]['unselectedCycles'] && this.donationOutcomes[0]['unselectedCycles'].length > 0) {
                this.unselectedCycles = [...new Set(
                    this.donationOutcomes[0]['unselectedCycles'].filter(item => typeof item !== 'object' || Object.keys(item).length > 0)
                )];
            }

            console.log('this.donationOutcomes >>> ' + JSON.stringify(this.donationOutcomes));

            if (this.donationOutcomes[0]['noAgencyChecked']) {
                this.noAgencyChecked = this.donationOutcomes[0]['noAgencyChecked'];
                const cyclesList = Array(this.totalDonationsCount)
                    .fill()
                    .map((_, index) => ({
                        index: index,
                        cycleId: `${index + 1}`,
                        cycleName: `Cycle ${index + 1}`,
                        disabled: true,
                        checked: false
                    }));
                this.donationOutcomes = this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    cycles: cyclesList
                }));
                this.clsNamestring = 'textcls addagencycls inputscls disableAddAnotherClickCls';
            }
        }
        else {
            const cyclesList = Array(this.totalDonationsCount)
                .fill()
                .map((_, index) => ({
                    index: index,
                    cycleId: `${index + 1}`,
                    cycleName: `Cycle ${index + 1}`,
                    disabled: false,
                    checked: false
                }));
            this.donationOutcomeObject.cycles = [...cyclesList];
            this.donationOutcomes = [{
                ...this.donationOutcomeObject,
                index: 0,
                headingIndex: 1
            }];
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
            let result = await createCoordinator({ coordinateData: JSON.stringify(this.donationOutcomes[index].Coordinator) });
            console.log('Result createCoordinator >>> ' + JSON.stringify(result));
            if (result.isSuccess) {
                let coordinatorRecord = JSON.parse(result.message);
                if (this.donationOutcomes[index]['CoordinatorName']) {
                    let res = await deleteCoordinator({ coordinatorId: this.donationOutcomes[index]['CoordinatorName'] });
                    console.log('Result deleteCoordinator >>> ' + JSON.stringify(res));
                }
                this.donationOutcomes[index]['CoordinatorName'] = coordinatorRecord.coordinatorId;
                this.donationOutcomes[index]['Coordinator']['coordinatorId'] = coordinatorRecord.coordinatorId;
                this.donationOutcomes[index]['openCoordinator'] = false;
            }
        }
    }


    handleCoordinatorChange(event) {
        let { name, dataset, value } = event.currentTarget;
        this.donationOutcomes[parseInt(dataset.index)].Coordinator[name] = value;
    }


    handleOpenCreateCoordinator(event) {
        try {
            let index = parseInt(event.target.dataset.index);
            let datatype = event.target.dataset.type;
            if (datatype == 'Contact') {
                this.donationOutcomes[index].openCoordinator = !this.donationOutcomes[index].openCoordinator;
            }
            else if (datatype == 'Account') {
                this.donationOutcomes[index].isDisabled = false;
                this.donationOutcomes[index].AgencyName = '';
                this.donationOutcomes[index].Website = '';
                this.donationOutcomes[index].Phone = '';
                this.donationOutcomes[index].agencyId = '';
            }
        } catch (e) {
            console.error(`connectedCallback Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    async handleValueSelectedOnAccount(event) {
        try {
            if (event.detail) {
                let datatype = event.target.dataset.type;
                let index = parseInt(event.target.dataset.index, 10);
                if (datatype == 'Account') {
                    let accountRecord = await getRecord({ accountId: event.detail.id });
                    console.log('Result getRecord >>> ' + JSON.stringify(accountRecord))
                    console.log('this.donationOutcomes >>> ' + JSON.stringify(this.donationOutcomes[index]));
                    this.donationOutcomes[index].isDisabled = true;
                    this.donationOutcomes[index].AgencyName = accountRecord.Name;
                    this.donationOutcomes[index].Website = accountRecord.Website;
                    this.donationOutcomes[index].Phone = accountRecord.Phone;
                    this.donationOutcomes[index].agencyId = event.detail.id;
                    this.donationOutcomes[index]['Coordinator']['parentId'] = event.detail.id;
                }
                else if (datatype == 'Contact') {
                    this.donationOutcomes[index].CoordinatorName = event.detail.id;
                }
            }
        }
        catch (e) {
            console.error(`handleValueSelectedOnAccount Error: ${e?.name || 'Error'} - ${e?.message} | Stack: ${e?.stack}`);
        }
    }


    get donationOutcomes() {
        return this.donationOutcomes;
    }

    handleLookupData(event) {
        console.log(event.detail);
        let index = event.target.dataset.index;
        let datatype = event.target.dataset.type;
        if (datatype == 'Account') {
            this.donationOutcomes[index]['disableAddIcon'] = event.detail;
        }
        else if (datatype == 'Contact') {
            this.donationOutcomes[index]['disableContactAddIcon'] = event.detail;
        }
    }


    handleAddAnotherClinic() {
        this.donationOutcomes = this.donationOutcomes.map(outcome => ({
            ...outcome,
            cycles: outcome.cycles.map(cycle => ({
                ...cycle
            }))
        }));

        if (this.donationOutcomes.length < this.totalDonationsCount) {
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
                cycles: newCyclesList
            };

            let outcomesRecordsList = [...this.donationOutcomes];
            outcomesRecordsList.push(obj);
            outcomesRecordsList.forEach((outcome, index) => {
                outcome.index = index;
                outcome['headingIndex'] = index + 1;
                outcome['agencyHeading'] = this.donationOutcomes.length === 1 ? 'Agency/Egg Bank Info' : '';
            });
            this.donationOutcomes = [...outcomesRecordsList];
        } else {
            alert('Maximum number of agencies reached.');
        }
    }

    handleCycleChange(event) {
        let outComeRecordfIndex = parseInt(event.target.dataset.outcomeindex);
        let cycleIndex = parseInt(event.target.dataset.cycleindex);
        //let outcomesList = [...this.donationOutcomes];


        let outcomesList = this.donationOutcomes.map(outcome => ({
            ...outcome,
            cycles: outcome.cycles.map(cycle => ({ ...cycle }))
        }));

        for (let i = 0; i < outcomesList.length; i++) {
            if (event.target.checked) {
                if (i !== outComeRecordfIndex) {
                    outcomesList[i].cycles[cycleIndex].checked = false;
                    outcomesList[i].cycles[cycleIndex].disabled = true;
                } else {
                    outcomesList[i].cycles[cycleIndex].checked = true;
                }
            } else {
                if (i !== outComeRecordfIndex) {
                    outcomesList[i].cycles[cycleIndex].disabled = false;
                }
                if (i === outComeRecordfIndex) {
                    outcomesList[i].cycles[cycleIndex].checked = false;
                }
            }
        }

        // Now update selectedCycles for each outcome
        outcomesList = outcomesList.map(outcome => ({
            ...outcome,
            selectedCycles: outcome.cycles
                .filter(cycle => cycle.checked)
                .map(cycle => cycle.cycleId)
        }));

        this.donationOutcomes = [...outcomesList];
        for (let i in this.totalSelectedCycles) {
            this.totalSelectedCycles[i] = parseInt(this.totalSelectedCycles[i])
        }
        if (event.target.checked) {
            if (!this.totalSelectedCycles.includes(parseInt(cycleIndex) + 1)) {
                this.totalSelectedCycles.push(parseInt(cycleIndex) + 1);
            }
        } else {
            this.totalSelectedCycles = this.totalSelectedCycles.filter(
                selectedCycle => selectedCycle !== cycleIndex + 1
            );
        }

        /*if(this.totalSelectedCycles.length > 0){
            this.showInformation = false;
        }*/
        this.showInformation = false;
    }



    handleDeleteConfirm(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.donationOutcomes = this.donationOutcomes.map(outcome => ({
            ...outcome,
            cycles: outcome.cycles.map(cycle => ({ ...cycle }))
        }));
        const agency = this.donationOutcomes.find(outcome => outcome.index === index);
        this.deleteIndex = index;
        this.deleteAgencyNumber = agency ? agency.headingIndex : null;
        this.showDeletePopup = true;
    }

    async handleDeleteYes() {
        const index = this.deleteIndex;
        //let outcomesList = [...this.donationOutcomes];
        let outcomesList = this.donationOutcomes.map(outcome => ({
            ...outcome,
            cycles: outcome.cycles.map(cycle => ({ ...cycle }))
        }));

        const checkedCyclesInDeletedRow = outcomesList[index].cycles
            .map((cycle, cycleIndex) => cycle.checked ? cycleIndex : null)
            .filter(i => i !== null);


        let agencyId = outcomesList[index].agencyId;

        if (agencyId) {
            let resultData = await deleteCycleAgency({ agencyId: agencyId })
            console.log('Delete Agency >>> ' + JSON.stringify(resultData));
        }

        outcomesList.splice(index, 1);


        outcomesList.forEach((outcome, i) => {
            outcome.index = i;
            outcome.headingIndex = i + 1;
        });

        checkedCyclesInDeletedRow.forEach(cycleIndex => {
            const isStillSelected = outcomesList.some(outcome =>
                outcome.cycles[cycleIndex]?.checked
            );

            if (!isStillSelected) {
                outcomesList.forEach(outcome => {
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
        this.donationOutcomes.length == 1 ? this.showNumberedHeadings = false : this.showNumberedHeadings = true;
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteAgencyNumber = null;
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteAgencyNumber = null;
    }

    handleNoAgencyChange(event) {
        this.noAgencyChecked = event.target.checked;

        if (event.target.checked) {
            let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
            if (cycleCheckboxclsList.length > 0) {
                let anyChecked = false;
                cycleCheckboxclsList.forEach(cycle => {
                    if (cycle.checked) {
                        anyChecked = true;
                    }
                });
                if (anyChecked == false) {
                    cycleCheckboxclsList.forEach(cycle => {
                        cycle.disabled = true
                    });
                    this.showInformation = false;
                }
                else {
                    this.template.querySelector('.checkboxPrimaryCls').checked = false;
                    this.noAgencyChecked = false;
                    this.showInformation = true;
                }

            }
        }
        else {
            let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
            if (cycleCheckboxclsList.length > 0) {
                cycleCheckboxclsList.forEach(cycle => {
                    cycle.disabled = false
                });
            }
            if (this.donationOutcomes.length == 1) {
                const cyclesList = Array(this.totalDonationsCount)
                    .fill()
                    .map((_, index) => ({
                        index: index,
                        cycleId: `${index + 1}`,
                        cycleName: `Cycle ${index + 1}`,
                        disabled: false,
                        checked: false
                    }));
                this.donationOutcomes = this.donationOutcomes.map(outcome => ({
                    ...outcome,
                    cycles: cyclesList
                }));
            }
            this.clsNamestring = 'textcls addagencycls inputscls';
        }
    }

    handleInputChange(event) {
        this.donationOutcomes = this.donationOutcomes.map(outcome => ({
            ...outcome,
            cycles: outcome.cycles.map(cycle => ({ ...cycle }))
        }));

        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.name;
        console.log('Test Valid Befre>>> ' + JSON.stringify(this.donationOutcomes))
        this.donationOutcomes = this.donationOutcomes.map(outcome =>
            parseInt(outcome.index) === index
                ? { ...outcome, [field]: event.target.value }
                : outcome
        );
        const input = event.target;
        if (input.validity.valid) {
            input.setCustomValidity('');
            input.reportValidity();
        }
        else {
            // console.log('not valid')
        }

    }

    handleInputBlur(event) {
        const input = event.target;
        const fieldName = input.name;
        const value = input.value;
        const fieldsMap = new Map();
        fieldsMap.set('AgencyName', 'Please enter agency name');
        fieldsMap.set('Website', 'Please enter website');
        fieldsMap.set('Phone', 'Please enter phone number');
        fieldsMap.set('Email', 'Please enter email');
        fieldsMap.set('CoordinatorName', 'Please enter coordinator name');

        if (fieldsMap.has(fieldName)) {
            if (value === '') {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        }


    }

    handleEggAgencyOrBankWithoutEDNBack() {
        this.contactObj['agenciesWithoutCode'] = this.donationOutcomes;
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }

    handleEggAgencyOrBankWithoutEDNNext() {
        // let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
        // if(cycleCheckboxclsList.length > 0){
        //     let isValidated = true;
        //     cycleCheckboxclsList.forEach(cycle => {
        //         if ((cycle.checked == false) && (cycle.disabled == false)) {
        //             isValidated = false;
        //         }
        //     })
        //     this.showInformation = !isValidated;
        // }
        // if(!this.showInformation){
        if (this.template.querySelector('.checkboxPrimaryCls') && this.template.querySelector('.checkboxPrimaryCls').checked) {
            console.log('If Condition')
            this.donationOutcomes[0]['noAgencyChecked'] = true;
            this.contactObj['agenciesWithoutCode'] = this.donationOutcomes;
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }
        else {
            console.log('Else Condition')
            this.donationOutcomes[0]['noAgencyChecked'] = false;
            const fieldsMap = new Map();
            fieldsMap.set('AgencyName', 'Please enter agency name');
            fieldsMap.set('Website', 'Please enter website');
            fieldsMap.set('Phone', 'Please enter phone number');
            fieldsMap.set('Email', 'Please enter email');
            fieldsMap.set('CoordinatorName', 'Please enter coordinator name');

            let isValid = true;
            this.template.querySelectorAll('lightning-input').forEach(input => {
                if (fieldsMap.has(input.name) && input.value === '' && input.name == 'AgencyName') {
                    input.setCustomValidity(fieldsMap.get(input.name));
                    input.reportValidity();
                    isValid = false;
                } else {
                    input.setCustomValidity('');
                    input.reportValidity();
                }
            });

            if (isValid) {
                for (let i in this.totalSelectedCycles) {
                    this.totalSelectedCycles[i] = parseInt(this.totalSelectedCycles[i]);
                }
                for (let i = 1; i <= this.totalDonationsCount; i++) {
                    if (this.totalSelectedCycles.includes(i)) {
                        continue;
                    }

                    let alreadyExists = false;
                    for (let j = 0; j < this.unselectedCycles.length; j++) {
                        if (this.unselectedCycles[j].cycledId === i) {
                            alreadyExists = true;
                            break;
                        }
                    }

                    if (!alreadyExists) {
                        let obj = {};
                        obj['label'] = 'Cycle ' + i;
                        obj['checked'] = false;
                        obj['disabled'] = false;
                        obj['confirmedNo'] = false;
                        obj['cycledId'] = i;
                        obj['selectedYes'] = false
                        this.unselectedCycles.push(obj);
                    }
                }

                console.log('this.unselectedCycles Final >>> ' + JSON.stringify(this.unselectedCycles));

                if (this.unselectedCycles && this.unselectedCycles.length > 0) {
                    this.handleAgencyMissedCycles(true);
                }

                console.log(JSON.stringify(this.unselectedCycles))
                /** this section is for navigating from screen main next button to next screens*/
                let navigateToNextscreen = false
                if (this.totalSelectedCycles.length == this.totalDonationsCount) {
                    navigateToNextscreen = true;
                }
                else {
                    console.log('this.unselectedCycles 1555 >>> ' + JSON.stringify(this.unselectedCycles));
                    if (this.unselectedCycles && this.unselectedCycles.length > 0) {
                        let unselectedFiltering = [];
                        this.unselectedCycles.forEach(cycle => {
                            console.log('cycle[confirmedNo] >>> ' + JSON.stringify(cycle));
                            if (cycle['confirmedNo']) {
                                unselectedFiltering.push('yes');
                            }
                        })
                        navigateToNextscreen = (unselectedFiltering.length == this.unselectedCycles.length)
                        console.log('navigateToNextscreen >>> ' + navigateToNextscreen);
                    }
                }
                if (navigateToNextscreen) {
                    console.log('this.donationOutcomes >>> ' + JSON.stringify(this.donationOutcomes));
                    this.donationOutcomes[0]['totalSelectedCycles'] = this.totalSelectedCycles;
                    this.donationOutcomes[0]['unselectedCycles'] = this.unselectedCycles;
                    this.contactObj['agenciesWithoutCode'] = this.donationOutcomes;
                    console.clear();
                    console.log('this.contactObj >>> ' + JSON.stringify(this.contactObj));
                    this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                }
            }
        }
        //  }
    }

    handleYesClick(event) {
        const cycleId = event.target.dataset.cycle;
        if (this.donationOutcomes.length < this.totalDonationsCount) {
            this.showNumberedHeadings = true;
            const newCyclesList = Array(this.totalDonationsCount)
                .fill()
                .map((_, index) => ({
                    index: index,
                    cycleId: `${index + 1}`,
                    cycleName: `Cycle ${index + 1}`,
                    disabled: this.totalSelectedCycles.includes(index + 1),
                    checked: `${index + 1}` === cycleId
                }));

            let obj = {
                ...this.donationOutcomeObject,
                cycles: newCyclesList
            };

            let outcomesRecordsList = [...this.donationOutcomes];
            outcomesRecordsList.push(obj);
            outcomesRecordsList.forEach((outcome, index) => {
                outcome.index = index;
                outcome['headingIndex'] = index + 1;
                outcome['agencyHeading'] = this.donationOutcomes.length === 1 ? 'Agency/Egg Bank Info' : '';
            });
            this.donationOutcomes = [...outcomesRecordsList];
            this.totalSelectedCycles.push(parseInt(cycleId));
            this.showPopup = false;
            this.showBackButton = false;
        } else {
            alert('Maximum number of agencies reached.');
        }
    }

    handleNoClick(event) {

    }

    handleBackFromPopup() {
        this.showPopup = false;
        this.showBackButton = false;
    }

    handleNextFromPopup() {
        if (!this.isNextButtonDisabled) {
            this.showPopup = false;
            this.showBackButton = false;
            this.contactObj['agenciesWithoutCode'] = this.donationOutcomes
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }
    }

    get disableAddAnotherClinic() {

        let clsName = 'textcls addagencycls inputscls ';
        if (this.clsNamestring != null) {
            clsName = this.clsNamestring;
        }
        if (this.totalSelectedCycles && this.totalSelectedCycles.length == this.totalDonationsCount) {
            clsName += ' disableAddAnotherClickCls';
        }
        if (this.template.querySelector('.checkboxPrimaryCls') && this.template.querySelector('.checkboxPrimaryCls').checked) {
            clsName += ' disableAddAnotherClickCls';
        }
        return clsName;
    }

    get isNextButtonDisabled() {

    }

    get checkboxStatus() {
        /*let result = false;
        if (this.donationOutcomes && this.donationOutcomes.length > 1) {
            result = true;
        }*/
        return true;
    }

    handleAgencyMissedCycles(isModalPopup) {
        if (isModalPopup == true) {
            let resultArray = [];
            this.unselectedCycles = this.unselectedCycles.filter(cycle =>
                !this.totalSelectedCycles.includes(cycle.cycledId)
            );
            this.unselectedCycles.forEach(cycle => {
                if (cycle['confirmedNo'] == false) {
                    resultArray.push('confirmedNo');
                }
            })
            //alert('>');
            console.log('>')
            console.log(JSON.stringify(this.unselectedCycles))
            console.log(JSON.stringify(this.totalSelectedCycles))
            console.log('>')
            this.showMissedCycles = resultArray.length > 0 ? true : false;
        }
        else {
            this.showMissedCycles = false;
            this.showMissedPopupBackButton = false;
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
            // else{
            //     obj['confirmedNo'] = false;
            // }
            return obj;
        });
        this.notIntrestedForAgencyCyclesList = this.unselectedCycles.filter(cycle => cycle.selectedYes == true);
        console.log(JSON.stringify(this.unselectedCycles));
        console.log('notIntrestedForAgencyCyclesList Yes >>> ' + JSON.stringify(this.notIntrestedForAgencyCyclesList))
        // this.notIntrestedForAgencyCyclesList = [];
        this.showMissedPopupBackButton = true;
    }

    handleMissedCycleNoClick(event) {
        try {
            let cyclename = event.target.dataset.cyclename;
            let cycleId = parseInt(event.target.dataset.cycle, 10);
            if (!this.unselectedCyclesFilterList.includes(cyclename)) {
                this.unselectedCyclesFilterList.push(cyclename);
            }

            this.unselectedCycles = this.unselectedCycles.map(cycle => {
                let obj = { ...cycle }
                if (cycle['cycledId'] == cycleId) {
                    obj['selectedYes'] = true;
                }
                // else{
                //     obj['confirmedNo'] = true;
                // }
                return obj;
            });
            this.notIntrestedForAgencyCyclesList = this.unselectedCycles.filter(cycle => cycle.selectedYes == true);
            console.log(JSON.stringify(this.unselectedCycles));
            console.log('notIntrestedForAgencyCyclesList No >>> ' + JSON.stringify(this.notIntrestedForAgencyCyclesList))
            this.showMissedPopupBackButton = false;
        }
        catch (e) {
            console.log('error')
            console.log(e.message)
            confirm.log(e.stack)
        }

    }

    handleBackFromMissedPopup() {
        this.handleAgencyMissedCycles(false);
        this.unselectedCycles = this.unselectedCycles.filter(cycle =>
            !this.unselectedCyclesFilterList.includes(cycle.label)
        );


    }

    handleNextFromMissedPopup() {
        this.unselectedCycles = this.unselectedCycles.map(cycle => {
            return { ...cycle, confirmedNo: true };
        });
        this.donationOutcomes[0]['totalSelectedCycles'] = this.totalSelectedCycles;
        this.donationOutcomes[0]['unselectedCycles'] = this.unselectedCycles;
        this.contactObj['agenciesWithoutCode'] = this.donationOutcomes;
        this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
    }

    get showNextFromMissedPopupButton() {
        // console.log(this.notIntrestedForAgencyCyclesList.length + '___unseleted'+ this.unselectedCycles.length)
        // console.log(JSON.stringify(this.notIntrestedForAgencyCyclesList))

        let result = false;
        console.log('notIntrestedForAgencyCyclesList >>>  ' + JSON.stringify(this.notIntrestedForAgencyCyclesList))
        console.log('unselectedCycles >>>> ' + JSON.stringify(this.unselectedCycles));
        if (this.notIntrestedForAgencyCyclesList && this.notIntrestedForAgencyCyclesList.length > 0) {
            if (this.notIntrestedForAgencyCyclesList.length == this.unselectedCycles.length) {
                result = true;
                this.showMissedPopupBackButton = false;
            }
        }
        return result;
    }

    get disablePopupBackBtn() {
        return this.showMissedPopupBackButton ? 'popupBackBtnCls' : 'popupBackBtnDisable';
    }

    get disablePopupNextBtn() {
        return this.showNextFromMissedPopupButton ? 'popupBackBtnCls' : 'popupNextBtnDisable';
    }


}