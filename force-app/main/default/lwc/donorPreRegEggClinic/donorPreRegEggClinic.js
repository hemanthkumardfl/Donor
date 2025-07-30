import { LightningElement, track, api } from 'lwc';
import WARNING_ICON_LOGO from '@salesforce/resourceUrl/warningIcon';
import deleteCycleAgency from '@salesforce/apex/EggDonorAgencyWithCodeController.deleteCycleAgency'

export default class DonorPreRegEggClinic extends LightningElement {
    @track warningIcon = WARNING_ICON_LOGO;
    @track totalDonationsCount;
    @track donationOutcomes = [];
    @track noClinicChecked = false;
    @track showNumberedHeadings = false;
    @api donationBasicsInfo;
    @track deleteAgencyNumber = null;
    @track showDeletePopup = false;
    @api eggDonorClinicUserInput;
    @track totalSelectedCycles = [];
    @track deleteIndex = null;
    @track showInformation = false;
    @track clsNamestring = null;

    /** missed agencyclinic modal popup related variables **/
    @track unselectedCycles = [];
    @track showMissedCycles = false; //this variable controlls missed agency cycles popup model.
    @track showMissedPopupBackButton = false; //this vaiable conditionally displays button 
    @track unselectedCyclesFilterList = []; // this variable holds back selected list
    @track notIntrestedForAgencyCyclesList = []; //this variable holds the not intrested list
    @api contactObj;
    /** missed agencyclinic modal popup related variables ends here**/

    clinicInfoDonationOutcomeObject = {
        index: 0,
        clinicHeading: 'Fertility Clinic Info',
        ClinicName: '',
        DoctorName: '',
        Website: '',
        CityStateOfClinic: '',
        Phone: '',
        Email: '',
        CoordinatorName: '',
        cycles: [],
        selectedCycles: [],
        headingIndex: 0,
        clinicId: ''
    };


    get showAddAnother(){
        return (this.donationOutcomes.length < this.totalDonationsCount);
    }

    connectedCallback() {
        try {
            this.contactObj = JSON.parse(JSON.stringify(this.contactObj))
            this.totalDonationsCount = this.contactObj.donationBasics.egg['liveBirths'];
            if (this.contactObj && this.contactObj['clinicsWithoutCode'] && this.contactObj['clinicsWithoutCode'].length > 0) {
                this.donationOutcomes = this.contactObj['clinicsWithoutCode'].map(outcome => {
                    const updatedCycles = Array(this.totalDonationsCount)
                        .fill()
                        .map((_, index) => {
                            const prevCycle = outcome.cycles.find(c => parseInt(c.cycleId, 10) === index + 1);
                            return {
                                index: index,
                                cycleId: `${index + 1}`,
                                cycleName: `Cycle ${index + 1}`,
                                checked: prevCycle?.checked || false,
                                disabled: prevCycle ? prevCycle.disabled : false
                            };
                        });

                    return {
                        ...outcome,
                        cycles: updatedCycles
                    };
                });

                if (this.donationOutcomes[0]['totalSelectedCycles']) {
                    this.totalSelectedCycles = [...new Set(
                        this.donationOutcomes[0]['totalSelectedCycles'].filter(item => typeof item !== 'object' || Object.keys(item).length > 0)
                    )];
                }

                if (this.donationOutcomes[0]['unselectedCycles']) {
                    this.unselectedCycles = [...new Set(
                        this.donationOutcomes[0]['unselectedCycles'].filter(item => typeof item !== 'object' || Object.keys(item).length > 0)
                    )];
                }

                if (this.donationOutcomes[0]['noClinicChecked']) {
                    this.noClinicChecked = this.donationOutcomes[0]['noClinicChecked'];
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
                this.clinicInfoDonationOutcomeObject.cycles = [...cyclesList];
                this.donationOutcomes = [{
                    ...this.clinicInfoDonationOutcomeObject,
                    index: 0,
                    headingIndex: 1
                }];
            }
        }
        catch (e) {
            console.log('error');
            console.log(e.message);
            console.log(e.stack);
        }
    }

    handleAddAnotherClinic() {
        console.log('this.donationOutcomes before >>> ' + JSON.stringify(this.donationOutcomes));
        this.donationOutcomes = this.donationOutcomes.map(outcome => ({
            ...outcome,
            cycles: outcome.cycles.map(cycle => ({
                ...cycle
            }))
        }));
        console.log('this.donationOutcomes after >>> ' + JSON.stringify(this.donationOutcomes));
        console.log('this.donationOutcomes.length >>> '+this.donationOutcomes.length);
        console.log('this.totalDonationsCount >>> '+this.totalDonationsCount);
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
                ...this.clinicInfoDonationOutcomeObject,
                cycles: newCyclesList,
                index: this.donationOutcomes.length,
                headingIndex: this.donationOutcomes.length + 1
            };

            let outcomesRecordsList = [...this.donationOutcomes, obj];
            this.donationOutcomes = outcomesRecordsList.map((outcome, index) => ({
                ...outcome,
                index: index,
                clinicHeading: index === 0 ? 'Fertility Clinic Info' : '',
                headingIndex: index + 1
            }));
        } else {
            alert('Already have input sections for all cycles');
        }
    }

    handleCycleChange(event) {
        let outComeRecordIndex = parseInt(event.target.dataset.outcomeindex);
        let cycleIndex = parseInt(event.target.dataset.cycleindex);
        //let outcomesList = [...this.donationOutcomes];
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
                    outcomesList[outComeRecordIndex].cycles[cycleIndex].checked = true;
                }
            } else {
                if (i !== outComeRecordIndex) {
                    outcomesList[i].cycles[cycleIndex].disabled = false;
                }
                if (i === outComeRecordIndex) {
                    outcomesList[outComeRecordIndex].cycles[cycleIndex].checked = false;
                }
            }
        }

        outcomesList = outcomesList.map(outcome => ({
            ...outcome,
            selectedCycles: outcome.cycles
                .filter(cycle => cycle.checked)
                .map(cycle => cycle.cycleId)
        }));

        this.donationOutcomes = [...outcomesList];

        this.donationOutcomes = outcomesList.map(outcome => ({
            ...outcome,
            cycles: outcome.cycles.map(cycle => ({ ...cycle }))
        }));

        if (event.target.checked) {
            if (!this.totalSelectedCycles.includes(parseInt(cycleIndex) + 1)) {
                this.totalSelectedCycles.push(parseInt(cycleIndex) + 1);
            }
        } else {
            this.totalSelectedCycles = this.totalSelectedCycles.filter(
                selectedCycle => selectedCycle !== cycleIndex + 1
            );
        }

        if (this.totalSelectedCycles.length > 0) {
            this.showInformation = false;
        }

    }

    get disableAddAnotherClinic() {
        let clsName = 'textcls addagencycls inputscls ';
        if (this.clsNamestring != null) {
            clsName = this.clsNamestring;
        }

        //let clsName = 'textcls addagencycls inputscls';
        if (this.totalSelectedCycles.length === this.totalDonationsCount || this.noClinicChecked) {
            clsName += ' disableAddAnotherClickCls';
        }
        if (this.template.querySelector('.checkboxPrimaryCls') && this.template.querySelector('.checkboxPrimaryCls').checked) {
            clsName += ' disableAddAnotherClickCls';
        }
        return clsName;
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


        let agencyId = outcomesList[index].clinicId;

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

    /* handleDeleteClick(event) {
         const index = parseInt(event.target.dataset.index, 10);
         //let outcomesList = [...this.donationOutcomes];
 
         let outcomesList = this.donationOutcomes.map(outcome => ({
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
             outcome.clinicHeading = i === 0 ? 'Fertility Clinic Info' : '';
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
         this.showNumberedHeadings = this.donationOutcomes.length > 1;
     }*/

    handleNoClinicChange(event) {
        this.noClinicChecked = event.target.checked;
        // alert();
        //  console.log(JSON.stringify(this.donationOutcomes))
        //console.log(JSON.stringify(this.donationOutcomes.length))

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
                    this.noClinicChecked = false;
                    this.showInformation = true;
                }

            }
        } else {
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
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.name;
        this.donationOutcomes = this.donationOutcomes.map(outcome =>
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
        fieldsMap.set('ClinicName', 'Please enter clinic name');
        fieldsMap.set('DoctorName', 'Please enter doctor\'s name');
        fieldsMap.Cycles = 'Please select at least one cycle';
        fieldsMap.set('Website', 'Please enter website');
        fieldsMap.set('CityStateOfClinic', 'Please enter city/state of clinic');
        fieldsMap.set('Phone', 'Please enter phone number');
        fieldsMap.set('Email', 'Please enter email');
        fieldsMap.set('CoordinatorName', 'Please enter coordinator/nurse name');



        if (fieldsMap.has(fieldName)) {
            if (value === '') {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        }
    }

    handleEggClinicWithoutEDNBack() {
        this.contactObj['clinicsWithoutCode'] = this.donationOutcomes;
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }

    handleEggClinicWithoutEDNNext() {
        // this.showInformation = false;
        // if (this.showInformation == false) {
        if (this.template.querySelector('.checkboxPrimaryCls') && this.template.querySelector('.checkboxPrimaryCls').checked) {
            this.donationOutcomes[0]['noClinicChecked'] = true;
            this.donationOutcomes[0]['totalSelectedCycles'] = this.totalSelectedCycles;
            this.donationOutcomes[0]['unselectedCycles'] = this.unselectedCycles;
            this.contactObj['clinicsWithoutCode'] = this.donationOutcomes;
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }
        else {
            this.donationOutcomes[0]['noClinicChecked'] = false;
            const fieldsMap = new Map();
            fieldsMap.set('ClinicName', 'Please enter clinic name');
            fieldsMap.set('DoctorName', 'Please enter doctor\'s name');
            fieldsMap.Cycles = 'Please select at least one cycle';
            fieldsMap.set('Website', 'Please enter website');
            fieldsMap.set('CityStateOfClinic', 'Please enter city/state of clinic');
            fieldsMap.set('Phone', 'Please enter phone number');
            fieldsMap.set('Email', 'Please enter email');
            fieldsMap.set('CoordinatorName', 'Please enter coordinator/nurse name');

            let isValid = true;
            this.template.querySelectorAll('lightning-input').forEach(input => {
                if (fieldsMap.has(input.name) && input.value === '' && input.name == 'ClinicName') {
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
                                unselectedFiltering.push('yes');
                            }
                        })
                        navigateToNextscreen = (unselectedFiltering.length == this.unselectedCycles.length)
                    }
                }
                if (navigateToNextscreen) {
                    this.donationOutcomes[0]['totalSelectedCycles'] = this.totalSelectedCycles;
                    this.donationOutcomes[0]['unselectedCycles'] = this.unselectedCycles;
                    this.contactObj['clinicsWithoutCode'] = this.donationOutcomes;
                    console.log('cycles')
                    console.log(JSON.stringify(this.contactObj));
                    this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
                }
                /** this section is for navigating from screen main next button to next screens*/

                //this.dispatchEvent(new CustomEvent('next', { detail: this.donationOutcomes }));
            }
        }
        //}
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
                outcome['clinicHeading'] = this.donationOutcomes.length === 1 ? 'Fertility Clinic Info' : '';
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

    get checkboxStatus() {
        return true;
        // return this.donationOutcomes.length > 1;
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
            this.unselectedCycles = this.unselectedCycles.sort((a, b) => a.cycledId - b.cycledId);

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
        this.donationOutcomes[0]['totalSelectedCycles'] = this.totalSelectedCycles;
        this.donationOutcomes[0]['unselectedCycles'] = this.unselectedCycles;
        this.contactObj['clinicsWithoutCode'] = this.donationOutcomes;
        this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
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