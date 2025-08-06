import { LightningElement, api, track } from 'lwc';

export default class DonorPreRegCodeSubmission extends LightningElement {
    @track pmcCodes = [{ value: { one: '', two: '', three: '', four: '', five: '', six: '' } }];
    @track ednCodes = [{ value: { one: '', two: '', three: '', four: '', five: '', six: '' } }];
    @track sdnCodes = [{ value: { one: '', two: '', three: '', four: '', five: '', six: '' } }];
    @track embCodes = [{ value: { one: '', two: '', three: '', four: '', five: '', six: '' } }];
    @track recCodes = [{ value: { one: '', two: '', three: '', four: '', five: '', six: '' } }];
    @track isSkipped = false;
    @api codeSumbissionUserInput;
    @api contactObj;

    /************************************Embryo type starts************************************************ */
    @track isEmbryoDonor = false;
    @track connectionTypevalue = "Please select...";
    @track embryoOptionsObj = {'connectionTypevalue' : 'Please select...', 'contributedEggOptionValue' : 'Please select...', 
                                'contributedSpermOptionValue' : 'Please select...', 'embryoDonationProgramValue' : '', 'embryoFertilityAttorneyValue' : ''}

    get coonectionTypeOptions() {
        return [
            { label: 'I contributed the egg(s)', value: 'I contributed the egg(s)' },
            { label: 'I contributed the sperm', value: 'I contributed the sperm' },
            { label: 'I was connected to the embryos by love but not genetics', value: 'I was connected to the embryos by love but not genetics' },
        ];
    }

    get contributedEggOptions() {
        return [
            { label: 'Egg donor known', value: 'Egg donor known' },
            { label: 'Egg donor unknown', value: 'Egg donor unknown' },
            { label: 'Recipient Mother', value: 'Recipient Mother' },
        ];
    }

     get contributedSpermOptions() {
        return [
            { label: 'Sperm donor known', value: 'Sperm donor known' },
            { label: 'Anonymous Sperm donor', value: 'Anonymous Sperm donor' },
            { label: 'Recipient father', value: 'Recipient father' },
        ];
    }

     get donationProgramOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }

    get donationProgramOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }

    get fertilityAttorneyOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }



    handleConnectionTypeChange(event){
         this.embryoOptionsObj.connectionTypevalue = event.detail.value;
    }

    handleContributedEggOptionsChange(event){
         this.embryoOptionsObj.contributedEggOptionValue = event.detail.value;
    }

    handleContributedSpermOptionsChange(event){
         this.embryoOptionsObj.contributedSpermOptionValue = event.detail.value;
    }

    handleFertilityAttorneyChange(event){
        this.embryoOptionsObj.embryoDonationProgramValue = event.detail.value;
    }

    handleDonationProgramChange(event){
        this.embryoOptionsObj.embryoFertilityAttorneyValue = event.detail.value;
    }

    /***********************************Embryo type ends************************************************************/


    connectedCallback() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        if (this.contactObj['isSkipped']) {
            this.isSkipped = this.contactObj['isSkipped'];
        }
        this.contactObj['bypassStep'] = false;
        this.isEmbryoDonor = this.contactObj['donorType'] == "embryo" ? true : false;
        
        if(this.contactObj['donorType'] == "embryo" && this.contactObj['embryoOptionsObj']){
            this.embryoOptionsObj = this.contactObj['embryoOptionsObj'];
        }

        const codeMap = {
            PMC: this.pmcCodes,
            EDN: this.ednCodes,
            SDN: this.sdnCodes,
            EMB: this.embCodes,
            REC: this.recCodes
        };

        if (this.contactObj?.codes) {
            Object.entries(this.contactObj.codes).forEach(([code, codeList]) => {
                if (codeMap[code]) {
                    let flag = true;
                    codeList.forEach(num => {
                        if (num) {
                            if (flag) {
                                codeMap[code].splice(0, 1);
                                flag = false;
                            }
                            codeMap[code].push({ value: this.handleNumbers(num) });
                        }
                    });
                }
            });
        }
    }

    handleNumbers(number) {
        if (number.includes('-')) {
            number = number.split('-')[1];
        }
        const digits = number?.toString().padStart(6, '0').split('');
        return {
            one: digits[0] || '',
            two: digits[1] || '',
            three: digits[2] || '',
            four: digits[3] || '',
            five: digits[4] || '',
            six: digits[5] || ''
        };
    }

    handleInputChange(event) {
        const type = event.currentTarget.dataset.group;
        const rowIndex = parseInt(event.currentTarget.dataset.row);
        const inputIndex = parseInt(event.currentTarget.dataset.index);
        const index = (rowIndex * 6) + inputIndex;
        const value = event.currentTarget.value;
        const keyMap = ['one', 'two', 'three', 'four', 'five', 'six'];
        const classMap = {
            pmc: '.pmcInputCls',
            edn: '.ednInputCls',
            sdn: '.sdnInputCls',
            emb: '.embInputCls',
            rec: '.recInputCls'
        };

        // Handle focus
        const inputs = this.template.querySelectorAll(classMap[type]);
        if (value !== '' && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
        if (event.key === "Backspace" && value === '' && index > 0) {
            inputs[index - 1].focus();
        }

        // Handle value assignment
        const codeMap = {
            pmc: this.pmcCodes,
            edn: this.ednCodes,
            sdn: this.sdnCodes,
            emb: this.embCodes,
            rec: this.recCodes
        };
        if (codeMap[type] && keyMap[inputIndex]) {
            codeMap[type][rowIndex].value[keyMap[inputIndex]] = value;
        }
    }

    handleAddCode(event) {
        let type = event.target.dataset.name;
        let errorList = [];
        let sectionObj = { '.PMC': '.pmcInputCls', '.EDN': '.ednInputCls', '.SDN': '.sdnInputCls', '.EMB': '.embInputCls', '.REC': '.recInputCls' }
        this.template.querySelectorAll('.' + type).forEach(sectionDiv => {
            const inputList = sectionDiv.querySelectorAll(sectionObj['.' + type]);
            const hasEmpty = Array.from(inputList).some(input => input.value.trim() === '');
            const errorContainer = sectionDiv.querySelector('.slds-has-error');
            if (errorContainer) {
                errorContainer.classList.toggle('slds-hide', !hasEmpty);
            }
            inputList.forEach(input => input.classList.toggle('error-border', hasEmpty));
            errorList.push(hasEmpty);
        })
        if (errorList.some(hasEmpty => hasEmpty === true)) {
            return;
        }

        switch (type) {
            case 'PMC':
                this.pmcCodes = [...this.pmcCodes, { value: { one: '', two: '', three: '', four: '', five: '', six: '' } }];
                break;

            case 'EDN':
                this.ednCodes = [...this.ednCodes, { value: { one: '', two: '', three: '', four: '', five: '', six: '' } }];
                break;

            case 'SDN':
                this.sdnCodes = [...this.sdnCodes, { value: { one: '', two: '', three: '', four: '', five: '', six: '' } }];
                break;

            case 'EMB':
                this.embCodes = [...this.embCodes, { value: { one: '', two: '', three: '', four: '', five: '', six: '' } }];
                break;

            case 'REC':
                this.recCodes = [...this.recCodes, { value: { one: '', two: '', three: '', four: '', five: '', six: '' } }];
                break;
        }
    }

    handleRemoveCode(event) {
        let type = event.target.dataset.name;
        let index = event.target.dataset.index;
        switch (type) {
            case 'pmc':
                if (this.pmcCodes.length > 1) {
                    this.pmcCodes = this.pmcCodes.filter((item, i) => i != index);
                }
                break;

            case 'edn':
                if (this.ednCodes.length > 1) {
                    this.ednCodes = this.ednCodes.filter((item, i) => i != index);
                }
                break;

            case 'sdn':
                if (this.sdnCodes.length > 1) {
                    this.sdnCodes = this.sdnCodes.filter((item, i) => i != index);
                }
                break;

            case 'emb':
                if (this.embCodes.length > 1) {
                    this.embCodes = this.embCodes.filter((item, i) => i != index);
                }
                break;

            case 'rec':
                if (this.recCodes.length > 1) {
                    this.recCodes = this.recCodes.filter((item, i) => i != index);
                }
                break;
        }
    }

    handleSkip(event) {
        this.isSkipped = event.target.checked;
        this.template.querySelectorAll('input').forEach(input => {
            input.disabled = event.target.checked;
        });
        if (!this.isSkipped) {
            //  this.handleCodeSubmissionNext(this.isSkipped);
        }
        else {
            const errorContainers = this.template.querySelectorAll('.slds-has-error');
            if (errorContainers.length) {
                errorContainers.forEach(errorContainer => {
                    errorContainer.classList.toggle('slds-hide', true);
                });
            }
        }
    }

    gatherCodes(validate = true) {
        let isError = false;
        let codeList = {};
        let PMCList = [];
        let EDNList = [];
        let SDNList = [];
        let EMBList = [];
        let RECList = [];

        const sections = [
            { container: '.PMC', inputClass: '.pmcInputCls', list: PMCList, prefix: 'PMC-' },
            { container: '.EDN', inputClass: '.ednInputCls', list: EDNList, prefix: 'EDN-' },
            { container: '.SDN', inputClass: '.sdnInputCls', list: SDNList, prefix: 'SDN-' },
            { container: '.EMB', inputClass: '.embInputCls', list: EMBList, prefix: 'EMB-' },
            { container: '.REC', inputClass: '.recInputCls', list: RECList, prefix: 'REC-' }
        ];

        sections.forEach(({ container, inputClass, list, prefix }) => {
            this.template.querySelectorAll(container).forEach(sectionDiv => {
                let Code = [];
                const inputList = sectionDiv.querySelectorAll(inputClass);

                // ✅ Check for partial filling
                const values = Array.from(inputList).map(input => input.value.trim());
                const isPartialFill = values.some(v => v !== '') && values.some(v => v === '');

                if (validate) {
                    isError ||= isPartialFill;
                    const errorContainer = sectionDiv.querySelector('.slds-has-error');
                    if (errorContainer) {
                        errorContainer.classList.toggle('slds-hide', !isPartialFill);
                    }
                    inputList.forEach(input => input.classList.toggle('error-border', isPartialFill));
                }

                if (!validate || !isPartialFill) {
                    inputList.forEach(input => {
                        if (input.value.trim() !== '') {
                            Code.push(input.value);
                        }
                    });
                }

                if (Code.join('').length) {
                    list.push(prefix + Code.join(''));
                }
            });
        });

        return {
            isError,
            codeList: {
                PMC: PMCList,
                EDN: EDNList,
                SDN: SDNList,
                EMB: EMBList,
                REC: RECList,
                isSkipped: this.isSkipped || false
            }
        };
    }


    handleCodeSubmissionBack() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        const { codeList } = this.gatherCodes(false);
        this.contactObj['codes'] = codeList;
        this.contactObj['isSkipped'] = this.isSkipped;
        if (this.isSkipped) {
            this.contactObj['codes'] = null;
        }
        this.dispatchEvent(new CustomEvent('back', { detail: this.contactObj }));
    }

    handleCodeSubmissionNext() {
        this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
        const { isError, codeList } = this.gatherCodes(!this.isSkipped);
        if (!this.isSkipped) {
            this.contactObj['codes'] = codeList;
        }
        else {
            this.contactObj['codes'] = null;
        }
        this.contactObj['isSkipped'] = this.isSkipped;
        
        if(this.contactObj['donorType'] == "embryo"){
            this.contactObj['embryoOptionsObj'] = this.embryoOptionsObj
        }

        if (!isError || this.isSkipped) {
            this.dispatchEvent(new CustomEvent('next', { detail: this.contactObj }));
        }

        
    }


    HandleDelete(event) {
        let name = event.currentTarget.dataset.name;
        let index = event.currentTarget.dataset.index;
        if (name == "pmc") {
            this.pmcCodes.splice(index, 1);
        }
        if (name == "edn") {
            this.ednCodes.splice(index, 1);
        }
        if (name == "sdn") {
            this.sdnCodes.splice(index, 1);
        }
        if (name == "emb") {
            this.embCodes.splice(index, 1);
        }
        if (name == "rec") {
            this.recCodes.splice(index, 1);
        }
    }

}