import { LightningElement,track,api } from 'lwc';
import WARNING_ICON_LOGO from '@salesforce/resourceUrl/warningIcon';

export default class DummyEggAgency extends LightningElement {

@track warningIcon = WARNING_ICON_LOGO;
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

    @track unselectedCycles = [];
    @track showMissedCycles = false; 
    @track showMissedPopupBackButton = false; 
    @track unselectedCyclesFilterList = []; 
    @track notIntrestedForAgencyCyclesList = []; 

    @api contactObj = {"verificationType":"Email","terms":true,"preferredUserName":"smith@testjamesjones.com","preferredPassword":"test@123","phone":"+11234567889","newCodeList":null,"lastName":"smith@testjamesjones.com","isSkipped":true,"firstName":"smith@testjamesjones.com","email":"smith@testjamesjones.com","donorType":"egg","donorId":"003QL00000vyr2FYAQ","donationBasics":{"egg":{"liveBirths":5,"workWithAnyAgencyOrEggBank":true,"currentOrFutureDonation":true,"workWithAttorney":true,"haveIntendedParentDetails":true},"sperm":{}},"codes":{"PMC":["PMC-"],"EDN":["EDN-"],"SDN":["SDN-"],"EMB":["EMB-"],"REC":["REC-"],"isSkipped":true},"AccountId":null}

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
        headingIndex: 0
    };

    connectedCallback() {
        this.totalDonationsCount = this.contactObj.donationBasics.egg.liveBirths;
        if (this.eggDonorAgencyUserInput && this.eggDonorAgencyUserInput.length > 0) {
            this.donationOutcomes = [...this.eggDonorAgencyUserInput];
             this.donationOutcomes = this.eggDonorAgencyUserInput.map(outcome => {
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
            
            if(this.donationOutcomes[0]['totalSelectedCycles']){
                this.totalSelectedCycles = [... this.donationOutcomes[0]['totalSelectedCycles']];

                this.totalSelectedCycles = [...new Set(
                    this.totalSelectedCycles.filter(item => typeof item !== 'object' || Object.keys(item).length > 0)
                )];
            }

            if(this.donationOutcomes[0]['unselectedCycles']){
                this.unselectedCycles = [...new Set(
                    this.donationOutcomes[0]['unselectedCycles'].filter(item => typeof item !== 'object' || Object.keys(item).length > 0)
                )];
            }

            if(this.donationOutcomes[0]['noAgencyChecked']){
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
            

            console.log(JSON.stringify(this.donationOutcomes))
        } 
        else {
            // Initialize cycles based on totalDonationsCount
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

    get donationOutcomes() {
        return this.donationOutcomes;
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
        console.log(JSON.stringify(this.donationOutcomes))
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
        /*if(this.totalSelectedCycles.length > 0){
            this.showInformation = false;
        }*/
         this.showInformation = false;
        console.log(JSON.stringify(this.donationOutcomes));
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

    handleDeleteYes() {
        const index = this.deleteIndex;
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
        

        if(event.target.checked){
            let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
            if(cycleCheckboxclsList.length > 0){
                let anyChecked = false;
                cycleCheckboxclsList.forEach(cycle => {
                    if (cycle.checked) {
                        anyChecked = true;
                    }
                });
                if(anyChecked == false){
                    cycleCheckboxclsList.forEach(cycle => {
                        cycle.disabled = true
                    });
                    this.showInformation = false;
                }
                else{
                    this.template.querySelector('.checkboxPrimaryCls').checked = false;
                    this.noAgencyChecked = false;
                    this.showInformation = true;
                }
                
            }
        }
        else{
            let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
            if(cycleCheckboxclsList.length > 0){
                cycleCheckboxclsList.forEach(cycle => {
                    cycle.disabled = false
                });
            }
            if(this.donationOutcomes.length == 1){
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
        this.donationOutcomes = this.donationOutcomes.map(outcome =>
            outcome.index === index
                ? { ...outcome, [field]: event.target.value }
                : outcome
        );
        const input = event.target;
        if(input.validity.valid) {
            console.log('valid')
            input.setCustomValidity('');
            input.reportValidity();
        }
        else{
            console.log('not valid')
        }
      
    }

    handleInputBlur(event){
        const input = event.target;
        const fieldName = input.name;
        const value = input.value;
        const fieldsMap = new Map();
        fieldsMap.set('AgencyName', 'Please enter agency name');
        fieldsMap.set('Website', 'Please enter website');
        fieldsMap.set('Phone', 'Please enter phone number');
        fieldsMap.set('Email', 'Please enter email');
        fieldsMap.set('CoordinatorName', 'Please enter coordinator name');

        if(fieldsMap.has(fieldName)) {
            if (value === '') {
                input.setCustomValidity(fieldsMap.get(fieldName));
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity();
        }
        

    }

    handleEggAgencyOrBankWithoutEDNBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }

    handleEggAgencyOrBankWithoutEDNNext() {
        /*let cycleCheckboxclsList = this.template.querySelectorAll('.cycleCheckboxcls');
        if(cycleCheckboxclsList.length > 0){
            let anyChecked = true;
            cycleCheckboxclsList.forEach(cycle => {
                if (cycle.checked) {
                    anyChecked = false;
                }
            })
            this.showInformation = anyChecked;
        }*/
        this.showInformation = false;
        if(this.showInformation == false){
            if (this.template.querySelector('.checkboxPrimaryCls') && this.template.querySelector('.checkboxPrimaryCls').checked) {
                this.donationOutcomes[0]['noAgencyChecked'] = true;
                this.dispatchEvent(new CustomEvent('next', { detail: this.donationOutcomes })); 
            }
            else{
                this.donationOutcomes[0]['noAgencyChecked'] = false;
                const fieldsMap = new Map();
                fieldsMap.set('AgencyName', 'Please enter agency name');
                fieldsMap.set('Website', 'Please enter website');
                fieldsMap.set('Phone', 'Please enter phone number');
                fieldsMap.set('Email', 'Please enter email');
                fieldsMap.set('CoordinatorName', 'Please enter coordinator name');

                let isValid = true;
                this.template.querySelectorAll('lightning-input').forEach(input => {
                    if (fieldsMap.has(input.name) && input.value === '') {
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
                    
                    if(this.unselectedCycles && this.unselectedCycles.length > 0){
                        this.handleAgencyMissedCycles(true);
                    }

                    console.log(JSON.stringify(this.unselectedCycles))
                    /** this section is for navigating from screen main next button to next screens*/
                    let navigateToNextscreen = false
                    if(this.totalSelectedCycles.length == this.totalDonationsCount){
                    navigateToNextscreen = true;
                    }
                    else{
                        if(this.unselectedCycles && this.unselectedCycles.length > 0){
                            let unselectedFiltering =[];
                            this.unselectedCycles.forEach(cycle => {
                                if(cycle['confirmedNo'] == true){
                                    unselectedFiltering.push('yes'); navigateToNextscreen
                                }
                            })
                            navigateToNextscreen = unselectedFiltering.length == this.unselectedCycles.length ? true : false
                        }
                    }
                    if(navigateToNextscreen){
                        this.donationOutcomes[0]['totalSelectedCycles'] = this.totalSelectedCycles;
                        this.donationOutcomes[0]['unselectedCycles'] = this.unselectedCycles;
                        this.dispatchEvent(new CustomEvent('next', { detail: this.donationOutcomes }));  
                    }
                }
            }
        }
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
            this.dispatchEvent(new CustomEvent('next', { detail: this.donationOutcomes }));
        }
    }

    get disableAddAnotherClinic() {
       
        let clsName = 'textcls addagencycls inputscls ';
        if(this.clsNamestring != null){
            clsName = this.clsNamestring;
        }

        if (this.totalSelectedCycles.length == this.totalDonationsCount) {
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
        let result = false;
        if (this.donationOutcomes.length > 1) {
            result = true;
        }
        return result;
    }

     handleAgencyMissedCycles(isModalPopup){
        if(isModalPopup == true){
            let resultArray = [];
            this.unselectedCycles = this.unselectedCycles.filter(cycle =>
                !this.totalSelectedCycles.includes(cycle.cycledId)
            );
            this.unselectedCycles.forEach(cycle => {
                if(cycle['confirmedNo'] == false){
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
        else{
            this.showMissedCycles = false;
            this.showMissedPopupBackButton = false;
        }
    }

    handleMissedCycleYesClick(event){
        let cyclename = event.target.dataset.cyclename;
        let cycleId = parseInt(event.target.dataset.cycle, 10);

        if(!this.unselectedCyclesFilterList.includes(cyclename)) {
            this.unselectedCyclesFilterList.push(cyclename);
        }
        
         this.unselectedCycles = this.unselectedCycles.map(cycle => {
                let obj ={... cycle}
                if(cycle['cycledId'] == cycleId){
                    obj['selectedYes'] = false ;
                }  
                return obj;
        });
        this.notIntrestedForAgencyCyclesList = this.unselectedCycles.filter(cycle => cycle.selectedYes == true);
        console.log(JSON.stringify(this.unselectedCycles));
        this.notIntrestedForAgencyCyclesList = [];
        this.showMissedPopupBackButton = true;  
    }

    handleMissedCycleNoClick(event){
        try{
            let cyclename = event.target.dataset.cyclename;
            let cycleId = parseInt(event.target.dataset.cycle, 10);
            //this.notIntrestedForAgencyCyclesList
            //obj['cycledId'] = i;
            //obj['selectedYes'] = "No"
            this.unselectedCycles = this.unselectedCycles.map(cycle => {
                let obj ={... cycle}
                if(cycle['cycledId'] == cycleId){
                    obj['selectedYes'] = true ;
                }  
                return obj;
            });
            this.notIntrestedForAgencyCyclesList = this.unselectedCycles.filter(cycle => cycle.selectedYes == true);
            console.log(JSON.stringify(this.unselectedCycles));
            
            this.showMissedPopupBackButton = false;
        }
        catch(e){
            console.log('error')
            console.log(e.message)
            confirm.log(e.stack)
        }
        
    }

    handleBackFromMissedPopup(){
        this.handleAgencyMissedCycles(false);
        this.unselectedCycles = this.unselectedCycles.filter(cycle =>
            !this.unselectedCyclesFilterList.includes(cycle.label)
        );

        
    }

     handleNextFromMissedPopup(){
        this.unselectedCycles = this.unselectedCycles.map(cycle => {
            return { ...cycle, confirmedNo: true };
        });

        console.log(JSON.stringify(this.unselectedCycles));
        this.donationOutcomes[0]['totalSelectedCycles'] = this.totalSelectedCycles;
        this.donationOutcomes[0]['unselectedCycles'] = this.unselectedCycles;
        this.dispatchEvent(new CustomEvent('next', { detail: this.donationOutcomes }));
    }

     get showNextFromMissedPopupButton(){
        console.log(this.notIntrestedForAgencyCyclesList.length + '___unseleted'+ this.unselectedCycles.length)
        console.log(JSON.stringify(this.notIntrestedForAgencyCyclesList))
        
        let result = false;
        if(this.notIntrestedForAgencyCyclesList && this.notIntrestedForAgencyCyclesList.length > 0){
            if(this.notIntrestedForAgencyCyclesList.length == this.unselectedCycles.length){
                result = true;
                this.showMissedPopupBackButton = false;
            }
        }
        return result;
    }

    get disablePopupBackBtn(){
        let clsName = "popupBackBtnDisable"
        if(this.showMissedPopupBackButton == true){
            clsName = "popupBackBtnCls"
        }
        return clsName;
    }

    get disablePopupNextBtn(){
        let clsName = "popupNextBtnDisable"
        if(this.showNextFromMissedPopupButton == true){
            clsName = "popupNextBtnCls"
        }
        return clsName;
    }


}