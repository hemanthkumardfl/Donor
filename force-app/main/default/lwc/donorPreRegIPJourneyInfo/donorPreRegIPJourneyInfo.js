import { LightningElement, api, track } from 'lwc';
// import pmcAndEdnCodesValidation from '@salesforce/apex/PreRegistrationController.pmcAndEdnCodesValidation';
export default class DonorPreRegIPJourneyInfo extends LightningElement {
    @api eggDonors
    @api pmccodeslist;
    @track ednCodeEntry = { 'index' : 0,'one' : null, 'two' : null, 'three' : null, 'four' : null, 'five' : null, 'six' : null};
    @track eggDonorsNumbercount = 0;
    get ednCodeEntries(){
        return this.ednCodeEntriesList;
    }

    get eggdonorscount(){
        return this.eggDonorsNumbercount;
    }

    handleBackClick(){
         this.dispatchEvent(new CustomEvent('journeyinfobackclick', {
            detail: {
                message : true
            }
        }));
    }

    handleNextClinic(){
       /* if(this.eggDonorsNumbercount < 1){
            alert('select at least one donor')
        }
        else{
                if(this.eggDonors.length > 0){
                pmcAndEdnCodesValidation({'pmc' : this.pmccodeslist, 'edn' : this.eggDonors})
                .then(result => {
                    let s1 = 'false';
                    let s2 = 'false';
                    let s3 = 'false';

                    this.dispatchEvent(new CustomEvent('journeyinfocompleted', {
                        detail: {
                            message : {'s1' :s1 , 's2' : false, 's3' : s3, 'cs' : false, 'edncodesRecordList' : result}
                        }
                    }));
                })
                .catch(exception => {
                    alert('exception');
                    console.log(exception);
                })
            }
            else{
                this.dispatchEvent(new CustomEvent('journeyinfocompleted', {
                    detail: {
                        message : {'edncodesRecordList' : [{'screen1' : false, 'screen2' : false, 'screen3' : true}]},
                        eggDonorsNumbercount : this.eggDonorsNumbercount
                    }
                }));
            }
        }*/
       
    }

    handleAddNewEDN(event){
        this.eggDonorsNumbercount++
       /* if(this.isFirst1){
            this.isFirst1 = false;
             this.ednCodeEntriesList = [];
        }
        
        this.ednCodeEntriesList.push({ 'index' : this.ednCodeEntriesList.length,'one' : null, 'two' : null, 'three' : null, 'four' : null, 'five' : null, 'six' : null});*/
    }

    handleRemoveEDN(){
       this.eggDonorsNumbercount >0 ? this.eggDonorsNumbercount -- : 0;
    }

   /*  handleUserEdnInput(event) {
       
        const input = event.target;
        const index = parseInt(input.dataset.id, 10);
        const key = input.dataset.objkey;
        const groupIndex = parseInt(input.dataset.objindex, 10);

        const currentGroup = this.template.querySelectorAll(`.edninputcls[data-objindex="${groupIndex}"]`);
        
        if (event.type === 'input') {
            if (input.value.length > 1) {
                input.value = input.value.slice(0, 1);
            }
            if (input.value !== '' && index < currentGroup.length - 1) {
                currentGroup[index + 1].focus();
            }
            this.ednCodeEntriesList[groupIndex][key] = input.value ? input.value : null;
        }
        
        if (event.type === 'keydown' && event.key === "Backspace") {
            if (input.value === '' && index > 0) {
                currentGroup[index - 1].focus();
            }
        }
    }*/
    

}