import { LightningElement, track, api } from 'lwc';
import deleteCycleAttorney from '@salesforce/apex/EggDonorAttorneyWithCodeController.deleteCycleAttorney'

export default class DonorPreRegEggFertilityAttorney extends LightningElement {
    @track totalDonationsCount;
    @track attorneyDonationOutcomes = [];
    @track noAttorneyChecked = false;
    @track dontRememberChecked = false;
    @track showNumberedHeadings = false;
    @track showIntendedParentDetails = false;
    @track intendedParentDetails = '';
    @api donationBasicsInfo;
    @track deleteAgencyNumber = null;
    @track showDeletePopup = false;
    @api eggDonorAttorneyUserInput;
    @track totalSelectedCycles = [];
    @track deleteIndex = null;
    @track intededParentYesRadio = false;
    @track intededParentNoRadio = false;

    /** missed agencyclinic modal popup related variables **/
    @track unselectedCycles = [];
    @track showMissedCycles = false; //this variable controlls missed agency cycles popup model.
    @track showMissedPopupBackButton = false; //this vaiable conditionally displays button 
    @track unselectedCyclesFilterList = []; // this variable holds back selected list
    @track notIntrestedForAgencyCyclesList = []; //this variable holds the not intrested list
    /** missed agencyclinic modal popup related variables ends here**/
    @api contactObj;

    attorneyDonationOutcomeObject = {
        index: 0,
        attorneyHeading: 'Fertility Attorney',
        attorneyNumber: 1,
        AttorneyName: '',
        LawFirm: '',
        State: '',
        Phone: '',
        Email: '',
        cycles: [],
        selectedCycles: [],
        headingIndex: 0,
        attorneyId: '',
        contactId: '',
        junctionId: ''
    };

    @track intendedYesRadioDisabled = false;
    @track intendedNoRadioDisabled = false;
    @track clsNamestring = null;


    get showAddAnother(){
        return (this.attorneyDonationOutcomes.length < this.totalDonationsCount);
    }


    connectedCallback() {
        try {
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj))
            console.log('Egg Fertility Attorney >>> '+JSON.stringify(this.contactObj));
            this.totalDonationsCount = this.contactObj.donationBasics.egg['liveBirths'];
            if (this.contactObj && this.contactObj['AttorniesWithoutCode'] && this.contactObj['AttorniesWithoutCode'].length > 0) {

                this.attorneyDonationOutcomes = this.contactObj['AttorniesWithoutCode'].map(outcome => ({
                    ...outcome,
                    cycles: outcome.cycles.map(cycle => ({ ...cycle }))
                }));


                if (this.attorneyDonationOutcomes[0]['totalSelectedCycles']) {
                    this.totalSelectedCycles = [...new Set(
                        this.attorneyDonationOutcomes[0]['totalSelectedCycles']
                    )];
                }

                if (this.attorneyDonationOutcomes[0]['unselectedCycles'] && this.attorneyDonationOutcomes[0]['unselectedCycles'].length > 0) {
                    this.unselectedCycles = [...new Set(
                        this.attorneyDonationOutcomes[0]['unselectedCycles'].filter(item => typeof item !== 'object' || Object.keys(item).length > 0)
                    )];
                }
                if (this.attorneyDonationOutcomes[0]['noAttorneyChecked']) {
                    this.noAttorneyChecked = this.attorneyDonationOutcomes[0]['noAttorneyChecked'];
                    this.intendedYesRadioDisabled = true;
                    this.intendedNoRadioDisabled = true;

                    const cyclesList = Array(this.totalDonationsCount)
                        .fill()
                        .map((_, index) => ({
                            index: index,
                            cycleId: `${index + 1}`,
                            cycleName: `Cycle ${index + 1}`,
                            disabled: true,
                            checked: false
                        }));

                    this.attorneyDonationOutcomes = this.contactObj['AttorniesWithoutCode'].map(outcome => ({
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
                this.attorneyDonationOutcomeObject.cycles = [...cyclesList];
                this.attorneyDonationOutcomes = [{
                    ...this.attorneyDonationOutcomeObject,
                    index: 0,
                    headingIndex: 1
                }];
            }
        }
        catch (e) {
            console.log(e);
            console.log(e.stack);
            console.log(e.message)
        }
    }

    get noAttorneyOrDontRemember() {
        return this.noAttorneyChecked || this.dontRememberChecked;
    }

    handleAddAnotherAttorney() {
        if (this.attorneyDonationOutcomes.length < this.totalDonationsCount) {
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
                ...this.attorneyDonationOutcomeObject,
                cycles: newCyclesList,
                index: this.attorneyDonationOutcomes.length,
                headingIndex: this.attorneyDonationOutcomes.length + 1
            };

            let outcomesRecordsList = [...this.attorneyDonationOutcomes, obj];
            this.attorneyDonationOutcomes = outcomesRecordsList.map((outcome, index) => ({
                ...outcome,
                index: index,
                attorneyHeading: index === 0 ? 'Fertility Attorney' : '',
                headingIndex: index + 1,
                attorneyNumber: index + 1
            }));
        } else {
            alert('Already have input sections for all cycles');
        }
    }

    handleCycleChange(event) {
        let outComeRecordfIndex = parseInt(event.target.dataset.outcomeindex);
        let cycleIndex = parseInt(event.target.dataset.cycleindex);
        //let outcomesList = [...this.attorneyDonationOutcomes];
        let outcomesList = this.attorneyDonationOutcomes.map(outcome => ({
            ...outcome,
            cycles: outcome.cycles.map(cycle => ({ ...cycle }))
        }));



        for (let i = 0; i < outcomesList.length; i++) {
            if (event.target.checked) {
                if (i != outComeRecordfIndex) {
                    outcomesList[i].cycles[cycleIndex].checked = false;
                    outcomesList[i].cycles[cycleIndex].disabled = true;
                }
                if (i == outComeRecordfIndex) {
                    outcomesList[outComeRecordfIndex].cycles[cycleIndex].checked = event.target.checked;
                }
            }
            if (!event.target.checked) {
                if (i != outComeRecordfIndex) {
                    outcomesList[i].cycles[cycleIndex].disabled = false;
                }
                if (i === outComeRecordfIndex) {
                    outcomesList[outComeRecordfIndex].cycles[cycleIndex].checked = event.target.checked;
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

        this.attorneyDonationOutcomes = [...outcomesList];
        for (let i in this.totalSelectedCycles) {
            this.totalSelectedCycles[i] = parseInt(this.totalSelectedCycles[i])
        }
        if (event.target.checked) {
            if (!this.totalSelectedCycles.includes(cycleIndex + 1)) {
                this.totalSelectedCycles.push(cycleIndex + 1);
            }
        } else {
            this.totalSelectedCycles = this.totalSelectedCycles.filter(
                selectedCycle => selectedCycle !== cycleIndex + 1
            );
        }
    }

    get disableAddAnotherAttorney() {
        let clsName = 'textcls addagencycls inputscls ';
        if (this.clsNamestring != null) {
            clsName = this.clsNamestring;
        }

        if (this.totalSelectedCycles.length === this.totalDonationsCount || this.noAttorneyOrDontRemember) {
            clsName += ' disableAddAnotherClickCls';
        }

        if (this.template.querySelector('.checkboxPrimaryCls') && this.template.querySelector('.checkboxPrimaryCls').checked) {
            clsName += ' disableAddAnotherClickCls';
        }
        return clsName;
    }

    /* handleDeleteClick(event) {
         const index = parseInt(event.target.dataset.index, 10);
         //let outcomesList = [...this.attorneyDonationOutcomes];
 
         let outcomesList = this.attorneyDonationOutcomes.map(outcome => ({
             ...outcome,
             cycles: outcome.cycles.map(cycle => ({ ...cycle }))
         }));
         
         const checkedCyclesInDeletedRow = outcomesList[index].cycles
             .map((cycle, cycleIndex) => cycle.checked ? cycleIndex : null)
             .filter(i => i !== null);
         
         outcomesList.splice(index, 1);
         
         outcomesList.forEach((outcome, i) => {
             outcome.index = i;
             outcome.headingIndex = i + 1;
             outcome.attorneyHeading = i === 0 ? 'Fertility Attorney' : '';
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
         
         this.attorneyDonationOutcomes = outcomesList;
         this.showNumberedHeadings = this.attorneyDonationOutcomes.length > 1;
     }*/

    handleDeleteConfirm(event) {
        const index = parseInt(event.target.dataset.index, 10);
        this.attorneyDonationOutcomes = this.attorneyDonationOutcomes.map(outcome => ({
            ...outcome,
            cycles: outcome.cycles.map(cycle => ({ ...cycle }))
        }));
        const agency = this.attorneyDonationOutcomes.find(outcome => outcome.index === index);
        this.deleteIndex = index;
        this.deleteAgencyNumber = agency ? agency.headingIndex : null;
        this.showDeletePopup = true;
    }

   async handleDeleteYes() {
        const index = this.deleteIndex;
        //let outcomesList = [...this.donationOutcomes];
        let outcomesList = this.attorneyDonationOutcomes.map(outcome => ({
            ...outcome,
            cycles: outcome.cycles.map(cycle => ({ ...cycle }))
        }));

        const checkedCyclesInDeletedRow = outcomesList[index].cycles
            .map((cycle, cycleIndex) => cycle.checked ? cycleIndex : null)
            .filter(i => i !== null);

            let attorneyId = outcomesList[index].attorneyId;

            if (attorneyId) {
                let resultData = await deleteCycleAttorney({ attorneyId: attorneyId })
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

        this.attorneyDonationOutcomes = outcomesList;
        this.attorneyDonationOutcomes.length == 1 ? this.showNumberedHeadings = false : this.showNumberedHeadings = true;
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteAgencyNumber = null;
    }

    handleDeleteNo() {
        this.showDeletePopup = false;
        this.deleteIndex = null;
        this.deleteAgencyNumber = null;
    }

    handleNoAttorneyChange(event) {
        this.noAttorneyChecked = event.target.checked;
        if (this.noAttorneyChecked) {
            let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
            if (cycleCheckboxclsList.length > 0) {
                cycleCheckboxclsList.forEach(cycle => {
                    cycle.disabled = true
                });
            }
            let radioInputclsList = this.template.querySelectorAll('.radioInputclsfordisable');
            if (radioInputclsList.length > 0) {
                radioInputclsList.forEach(radioinput => {
                    radioinput.disabled = true
                });
            }
            let intendedparentinputboxcls = this.template.querySelector('.intendedparentinputboxcls');
            if (intendedparentinputboxcls) {
                intendedparentinputboxcls.disabled = true;
            }

            this.dontRememberChecked = false;
        }
        else {
            let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
            if (cycleCheckboxclsList.length > 0) {
                cycleCheckboxclsList.forEach(cycle => {
                    cycle.disabled = false
                });
            }
            let radioInputclsList = this.template.querySelectorAll('.radioInputclsfordisable');
            if (radioInputclsList.length > 0) {
                radioInputclsList.forEach(radioinput => {
                    radioinput.disabled = false
                });
            }
            let intendedparentinputboxcls = this.template.querySelector('.intendedparentinputboxcls');
            if (intendedparentinputboxcls) {
                intendedparentinputboxcls.disabled = false;
            }
            if (this.attorneyDonationOutcomes.length == 1) {
                const cyclesList = Array(this.totalDonationsCount)
                    .fill()
                    .map((_, index) => ({
                        index: index,
                        cycleId: `${index + 1}`,
                        cycleName: `Cycle ${index + 1}`,
                        disabled: false,
                        checked: false
                    }));
                this.attorneyDonationOutcomes = this.attorneyDonationOutcomes.map(outcome => ({
                    ...outcome,
                    cycles: cyclesList
                }));
            }
            this.clsNamestring = 'textcls addagencycls inputscls';
        }
    }

    handleDontRememberChange(event) {
        this.dontRememberChecked = event.target.checked;
        if (this.dontRememberChecked) {
            this.noAttorneyChecked = false;
        }
    }

    handleInputChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.name;
        this.attorneyDonationOutcomes = this.attorneyDonationOutcomes.map(outcome =>
            outcome.index === index
                ? { ...outcome, [field]: event.target.value }
                : outcome
        );
        const input = event.target;
        if (input.validity.valid) {
            console.log('valid')
            input.setCustomValidity('');
            input.reportValidity();
        }
        else {
            console.log('not valid')
        }
    }

    handleInputBlur(event) {
        const input = event.target;
        const fieldName = input.name;
        const value = input.value;
        const fieldsMap = new Map();
        fieldsMap.set('AttorneyName', 'Please enter attorney name');
        fieldsMap.set('LawFirm', 'Please enter law firm');
        fieldsMap.set('State', 'Please enter state');
        fieldsMap.set('Phone', 'Please enter phone number');
        fieldsMap.set('Email', 'Please enter email');



        if (fieldsMap.has(fieldName)) {
            if (value === '') {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        }
    }

    handleIntendedParentChange(event) {
        this.showIntendedParentDetails = event.target.value === 'yes';
        if (!this.showIntendedParentDetails) {
            this.intendedParentDetails = '';
        }
        if (event.target.value === 'yes') {
            this.showIntendedParentDetails = true;
            this.intededParentNoRadio = false;
            this.intededParentYesRadio = true;


        } else {
            this.showIntendedParentDetails = false;
            //this.intendedParentDetails = '';
            this.intededParentNoRadio = true;
            this.intededParentYesRadio = false;
        }
    }

    handleIntendedParentDetailsChange(event) {
        this.intendedParentDetails = event.target.value;
    }

    handleEggFertilityAttorneyWithoutEDNBack() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        this.contactObj['AttorniesWithoutCode'] = this.attorneyDonationOutcomes;
        this.contactObj['intendedParentDetails'] = this.intendedParentDetails;
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
        //this.dispatchEvent(new CustomEvent('back'));
    }

    handleEggFertilityAttorneyWithoutEDNNext() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        console.log('Egg Fertility Attorney Next >>> '+JSON.stringify(this.contactObj));
        // if (this.noAttorneyChecked) {
        //     this.attorneyDonationOutcomes[0]['noAttorneyChecked'] = true;
        //     this.attorneyDonationOutcomes[0]['totalSelectedCycles'] = this.totalSelectedCycles;
        //     this.attorneyDonationOutcomes[0]['unselectedCycles'] = this.unselectedCycles;
        //     this.contactObj['AttorniesWithoutCode'] = this.attorneyDonationOutcomes;
        //     this.contactObj['intendedParentDetails'] = this.intendedParentDetails;
        //     console.log(JSON.stringify(this.contactObj));
        //     this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        // }
        if (this.template.querySelector('.checkboxPrimaryCls') && this.template.querySelector('.checkboxPrimaryCls').checked) {
            console.log('If condition')
            this.attorneyDonationOutcomes[0]['noAttorneyChecked'] = true;
            this.contactObj['AttorniesWithoutCode'] = this.attorneyDonationOutcomes;
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }
        else {
            console.log('Else condition');
            this.attorneyDonationOutcomes[0]['noAttorneyChecked'] = false;
            const fieldsMap = new Map();
            fieldsMap.set('AttorneyName', 'Please enter attorney name');
            fieldsMap.set('LawFirm', 'Please enter law firm');
            fieldsMap.set('State', 'Please enter state');
            fieldsMap.set('Phone', 'Please enter phone number');
            fieldsMap.set('Email', 'Please enter email');

            let isValid = true;
            if (!this.noAttorneyOrDontRemember) {
                this.template.querySelectorAll('lightning-input[data-index]').forEach(input => {
                    if (fieldsMap.has(input.name) && input.value === '' && input.name == 'AttorneyName') {
                        input.setCustomValidity(fieldsMap.get(input.name));
                        input.reportValidity();
                        isValid = false;
                    } else {
                        input.setCustomValidity('');
                        input.reportValidity();
                    }
                });
            }

            if (isValid) {
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
                    if (this.unselectedCycles && this.unselectedCycles.length > 0) {
                        let unselectedFiltering = [];
                        this.unselectedCycles.forEach(cycle => {
                            if (cycle['confirmedNo'] == true) {
                                unselectedFiltering.push('yes'); navigateToNextscreen
                            }
                        })
                        navigateToNextscreen = unselectedFiltering.length == this.unselectedCycles.length ? true : false
                    }
                }
                if (navigateToNextscreen) {
                    this.attorneyDonationOutcomes[0]['totalSelectedCycles'] = this.totalSelectedCycles;
                    this.attorneyDonationOutcomes[0]['unselectedCycles'] = this.unselectedCycles;

                    this.contactObj['AttorniesWithoutCode'] = this.attorneyDonationOutcomes;
                    this.contactObj['intendedParentDetails'] = this.intendedParentDetails;
                    console.log('attornies >>>')
                    console.log(JSON.stringify(this.contactObj));
                    this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));

                    /*this.dispatchEvent(new CustomEvent('next', { 
                        detail: {
                            attorneyDonationOutcomes: this.attorneyDonationOutcomes,
                            intendedParentDetails: this.intendedParentDetails
                        }
                    }));*/
                }
            }
        }
    }

    get checkboxStatus() {
        return this.attorneyDonationOutcomes.length > 1;
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
                outcome['attorneyHeading'] = this.donationOutcomes.length === 1 ? 'Agency/Egg Bank Info' : '';
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
            this.contactObj['AttorniesWithoutCode'] = this.donationOutcomes
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }
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
            return obj;
        });
        this.notIntrestedForAgencyCyclesList = this.unselectedCycles.filter(cycle => cycle.selectedYes == true);
        console.log(JSON.stringify(this.unselectedCycles));
      //  this.notIntrestedForAgencyCyclesList = [];
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
        this.handleAgencyMissedCycles(false);
        this.unselectedCycles = this.unselectedCycles.filter(cycle =>
            !this.unselectedCyclesFilterList.includes(cycle.label)
        );


    }

    handleNextFromMissedPopup() {
        this.unselectedCycles = this.unselectedCycles.map(cycle => {
            return { ...cycle, confirmedNo: true };
        });

        console.log(JSON.stringify(this.unselectedCycles));
        this.attorneyDonationOutcomes[0]['totalSelectedCycles'] = this.totalSelectedCycles;
        this.attorneyDonationOutcomes[0]['unselectedCycles'] = this.unselectedCycles;
        this.contactObj['AttorniesWithoutCode'] = this.attorneyDonationOutcomes;
        this.contactObj['intendedParentDetails'] = this.intendedParentDetails;
        this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        /*this.dispatchEvent(new CustomEvent('next', { 
                    detail: {
                        attorneyDonationOutcomes: this.attorneyDonationOutcomes,
                        intendedParentDetails: this.intendedParentDetails
                    }
        }));*/
    }

    get showNextFromMissedPopupButton() {
        console.log(this.notIntrestedForAgencyCyclesList.length + '___unseleted' + this.unselectedCycles.length)
        console.log(JSON.stringify(this.notIntrestedForAgencyCyclesList))

        let result = false;
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