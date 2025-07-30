import { LightningElement, track, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadScript } from "lightning/platformResourceLoader";
import jsPDFLibrary from "@salesforce/resourceUrl/d21jsPDFLibrary";
import savePDFToContact from "@salesforce/apex/DonorPreRegHippaController.savePDFToContact";
import spermDonor from '@salesforce/apex/DonorPreRegHippaController2222.spermDonor';

export default class HipaaReleaseForm extends LightningElement {
  @api contactObj;
  @track isConfirmed = false;
  @track isLoading = false;
  @track signerror = false;
  @track formData = {
    name: "",
    dob: "",
    address: "",
    phone: "",
    email: "",
    agencies: [],
    spermBank: [],
    clinics: [],
    attorneys: [],
    recipients: [],
    showAttorneySection: false,
    showAgenciesSection: false,
    showSpermBanksSection: false,
    showRecipientsection: false ,
  };

  @track signature = "";
  @track isDrawing = false;
  @track isEmpty = true;

  jsPDFInitialized = false;
  canvas;
  ctx;
  iconBounds = { x: 375, y: 5, width: 20, height: 20 };

  connectedCallback() {
    this.initializeFormData();
  }

  renderedCallback() {
    if (!this.canvas) {
      this.initializeCanvas();
    }
    if (!this.jsPDFInitialized) {
      this.loadJsPDFLibrary();
    }
  }

  initializeFormData() {
    console.log('this.contactObj >>> '+JSON.stringify(this.contactObj));
    if (!this.contactObj) {
      // Default data for demo
      this.formData = {
        name: "Jane Smith",
        dob: "03/15/1992",
        address: "456 Oak Avenue, Springfield, IL 62701",
        phone: "(217) 555-0123",
        email: "jane.smith@email.com",
        agencies: [
          { id: crypto.randomUUID(), agencyName: "Springfield Family Services", index: 1 },
          { id: crypto.randomUUID(), agencyName: "Central Illinois Adoption Agency", index: 2 }
        ],
        spermBank: [],
        clinics: [
          { id: crypto.randomUUID(), clinicName: "Springfield Fertility Center", index: 1 },
          { id: crypto.randomUUID(), clinicName: "Midwest Reproductive Health", index: 2 }
        ],
        attorneys: [
          { id: crypto.randomUUID(), attorneyName: "Johnson & Associates Law Firm", index: 1 }
        ],
        recipients: [],
        showAgenciesSection: true,
        showSpermBanksSection: false,
        showAttorneySection: true,
        showRecipientsection: true
      };
      return;
    }


spermDonor({ donorId: this.contactObj.donorId})
            .then(result => {
                console.log('Result >>> '+JSON.stringify(result));
                  if (result.parentdetails) {
            this.formData.name = `${result.parentdetails.fristName || ''} ${result.parentdetails.lastName || ''}`.trim();
            this.formData.dob = result.parentdetails.dob || '';
            this.formData.address = result.parentdetails.address || '';
            this.formData.email = result.parentdetails.email || '';
            this.formData.phone = result.parentdetails.phone || '';
        }
                if (result.Agencylist) {
                    this.formData.agencies = result.Agencylist.map(item => ({
                        id: item.Id,
                        agencyName: item.Name,
                        phone: '',
                        coordinator: '',
                        website: '',
                        cityState: '',
                        email: ''
                    }));
                    
                        this.formData.spermBank = result.Agencylist.map(item => ({
                            id: item.Id,
                            spermBankName: item.Name,
                            phone: '',
                            coordinator: '',
                            website: '',
                            email: '',
                            isFromPrimaryBanks: false
                        }));
                    
                }
                if (result.Cliniclist) {
                    this.formData.clinics = result.Cliniclist.map(item => ({
                        id: item.Id,
                        clinicName: item.Name,
                        phone: '',
                        coordinator: '',
                        website: '',
                        cityState: '',
                        email: ''
                    }));
                }
                if (result.Attorneylist) {
                    this.formData.attorneys = result.Attorneylist.map(item => ({
                        id: item.Id,
                        attorneyName: item.Name,
                        lawFirm: '',
                        state: ''
                    }));
                }
                if (result.Recipientlist) {
                    this.formData.recipients = result.Recipientlist.map(item => ({
                        id: item.Id,
                        Name: (item.fristName ||'')+''+(item.lastName || ''),
                        phone: '',
                        email: '',
                        additionalInfo: ''
                    }));
                }
            })
            .catch(error => {
                this.showToast('Error', 'Failed to load donor data: ' + error.body.message, 'error');
            });




    // this.contactObj = JSON.parse(JSON.stringify(this.contactObj));
    // this.formData.name = `${this.contactObj.firstName|| ""} ${this.contactObj.lastName || ""}`.trim();
    // this.formData.dob = this.contactObj.dateOfBirth || "";
    // this.formData.address = this.contactObj.address || "";
    // this.formData.phone = this.contactObj.phone || "";
    // this.formData.email = this.contactObj.email || "";

    // Set visibility flags based on donorType
    if (this.contactObj.donorType === "egg") {
      this.formData.showAgenciesSection = true;
      this.formData.showSpermBanksSection = false;
      this.formData.showAttorneySection = true;
      this.formData.showRecipientsection = true;
    } else if (this.contactObj.donorType === "sperm") {
      this.formData.showAgenciesSection = false;
      this.formData.showSpermBanksSection = true;
      this.formData.showAttorneySection = false;
      this.formData.showRecipientsection = true;
    }
    this.formData.showclinicSection = true; // Clinics are always shown

    // Agencies for egg donors
  /*  if (this.contactObj.donorType === "egg") {
      let agencyData = [];
      if (this.contactObj.isSkipped === true) {
        if (this.contactObj.agenciesWithoutCode) {
          if (Array.isArray(this.contactObj.agenciesWithoutCode)) {
            agencyData = this.contactObj.agenciesWithoutCode.map((agency, index) => ({
              id: agency.id || crypto.randomUUID(),
              agencyName: agency.AgencyName || "",
              phone: agency.phone || "",
              coordinatorName: agency.coordinatorName || "",
              website: agency.website || "",
              cityState: agency.cityState || "",
              coordinatorEmail: agency.coordinatorEmail || "",
              index: index + 1
            }));
          } else {
            agencyData = [{
              id: crypto.randomUUID(),
              agencyName: this.contactObj.agenciesWithoutCode.AgencyName || "",
              phone: this.contactObj.agenciesWithoutCode.phone || "",
              coordinatorName: this.contactObj.agenciesWithoutCode.coordinatorName || "",
              website: this.contactObj.agenciesWithoutCode.website || "",
              cityState: this.contactObj.agenciesWithoutCode.cityState || "",
              coordinatorEmail: this.contactObj.agenciesWithoutCode.coordinatorEmail || "",
              index: 1
            }];
          }
        }
      } else {
        if (this.contactObj.agenciesWithCodes) {
          if (this.contactObj.agenciesWithCodes.donationOutcomesListFromApex) {
            if (Array.isArray(this.contactObj.agenciesWithCodes.donationOutcomesListFromApex)) {
              agencyData = agencyData.concat(
                this.contactObj.agenciesWithCodes.donationOutcomesListFromApex.map((agency, index) => ({
                  id: agency.id || crypto.randomUUID(),
                  agencyName: agency.AgencyName || "",
                  phone: agency.phone || "",
                  coordinatorName: agency.coordinatorName || "",
                  website: agency.website || "",
                  cityState: agency.cityState || "",
                  coordinatorEmail: agency.coordinatorEmail || "",
                  index: agencyData.length + index + 1
                }))
              );
            } else {
              agencyData.push({
                id: crypto.randomUUID(),
                agencyName: this.contactObj.agenciesWithCodes.donationOutcomesListFromApex.AgencyName || "",
                phone: this.contactObj.agenciesWithCodes.donationOutcomesListFromApex.phone || "",
                coordinatorName: this.contactObj.agenciesWithCodes.donationOutcomesListFromApex.coordinatorName || "",
                website: this.contactObj.agenciesWithCodes.donationOutcomesListFromApex.website || "",
                cityState: this.contactObj.agenciesWithCodes.donationOutcomesListFromApex.cityState || "",
                coordinatorEmail: this.contactObj.agenciesWithCodes.donationOutcomesListFromApex.coordinatorEmail || "",
                index: agencyData.length + 1
              });
            }
          }
          if (this.contactObj.agenciesWithCodes.additionalAgencies) {
            if (Array.isArray(this.contactObj.agenciesWithCodes.additionalAgencies)) {
              agencyData = agencyData.concat(
                this.contactObj.agenciesWithCodes.additionalAgencies.map((agency, index) => ({
                  id: agency.id || crypto.randomUUID(),
                  agencyName: agency.AgencyName || agency.Agency || "",
                  phone: agency.phone || "",
                  coordinatorName: agency.coordinatorName || "",
                  website: agency.website || "",
                  cityState: agency.cityState || "",
                  coordinatorEmail: agency.coordinatorEmail || "",
                  index: agencyData.length + index + 1
                }))
              );
            } else {
              agencyData.push({
                id: crypto.randomUUID(),
                agencyName: this.contactObj.agenciesWithCodes.additionalAgencies.AgencyName || this.contactObj.agenciesWithCodes.additionalAgencies.Agency || "",
                phone: this.contactObj.agenciesWithCodes.additionalAgencies.phone || "",
                coordinatorName: this.contactObj.agenciesWithCodes.additionalAgencies.coordinatorName || "",
                website: this.contactObj.agenciesWithCodes.additionalAgencies.website || "",
                cityState: this.contactObj.agenciesWithCodes.additionalAgencies.cityState || "",
                coordinatorEmail: this.contactObj.agenciesWithCodes.additionalAgencies.coordinatorEmail || "",
                index: agencyData.length + 1
              });
            }
          }
        }
      }
      this.formData.agencies = agencyData;
      this.formData.noAgencyChecked = this.contactObj.noAgencyChecked || false;
    }

    // Sperm banks for sperm donors
    if (this.contactObj.donorType === "sperm") {
      let spermData = [];
      if (this.contactObj.isSkipped === true) {
        if (this.contactObj.spermBanks) {
          if (Array.isArray(this.contactObj.spermBanks)) {
            spermData = this.contactObj.spermBanks.map((sperm, index) => ({
              id: sperm.id || crypto.randomUUID(),
              spermBankName: sperm.name || sperm.spermBankName || "",
              spermBankPhone: sperm.phone || "",
              coordinatorName: sperm.coordinator || "",
              spermBankWebsite: sperm.website || "",
              spermBankEmail: sperm.email || "",
              accountId: sperm.accountId || "",
              junctionId: sperm.junctionId || "",
              index: index + 1
            }));
          } else {
            spermData = [{
              id: crypto.randomUUID(),
              spermBankName: this.contactObj.spermBanks.name || this.contactObj.spermBanks.spermBankName || "",
              spermBankPhone: this.contactObj.spermBanks.phone || "",
              coordinatorName: this.contactObj.spermBanks.coordinator || "",
              spermBankWebsite: this.contactObj.spermBanks.website || "",
              spermBankEmail: this.contactObj.spermBanks.email || "",
              accountId: this.contactObj.spermBanks.accountId || "",
              junctionId: this.contactObj.spermBanks.junctionId || "",
              index: 1
            }];
          }
        }
      } else {
        if (this.contactObj.spermBanksWithSDN) {
          if (this.contactObj.spermBanksWithSDN.primaryBanksListFromApex) {
            if (Array.isArray(this.contactObj.spermBanksWithSDN.primaryBanksListFromApex)) {
              spermData = spermData.concat(
                this.contactObj.spermBanksWithSDN.primaryBanksListFromApex.map((sperm, index) => ({
                  id: sperm.id || crypto.randomUUID(),
                  spermBankName: sperm.bankName || sperm.spermBankName || "",
                  spermBankPhone: sperm.phone || "",
                  coordinatorName: sperm.coordinator || "",
                  spermBankWebsite: sperm.website || "",
                  spermBankEmail: sperm.email || "",
                  accountId: sperm.spermbankId || "",
                  junctionId: sperm.junctionId || "",
                  index: spermData.length + index + 1
                }))
              );
            } else {
              spermData.push({
                id: crypto.randomUUID(),
                spermBankName: this.contactObj.spermBanksWithSDN.primaryBanksListFromApex.bankName || this.contactObj.spermBanksWithSDN.primaryBanksListFromApex.spermBankName || "",
                spermBankPhone: this.contactObj.spermBanksWithSDN.primaryBanksListFromApex.phone || "",
                coordinatorName: this.contactObj.spermBanksWithSDN.primaryBanksListFromApex.coordinator || "",
                spermBankWebsite: this.contactObj.spermBanksWithSDN.primaryBanksListFromApex.website || "",
                spermBankEmail: this.contactObj.spermBanksWithSDN.primaryBanksListFromApex.email || "",
                accountId: this.contactObj.spermBanksWithSDN.primaryBanksListFromApex.spermbankId || "",
                junctionId: this.contactObj.spermBanksWithSDN.primaryBanksListFromApex.junctionId || "",
                index: spermData.length + 1
              });
            }
          }
          if (this.contactObj.spermBanksWithSDN.additionalBanks) {
            if (Array.isArray(this.contactObj.spermBanksWithSDN.additionalBanks)) {
              spermData = spermData.concat(
                this.contactObj.spermBanksWithSDN.additionalBanks.map((sperm, index) => ({
                  id: sperm.id || crypto.randomUUID(),
                  spermBankName: sperm.bankName || sperm.spermBankName || "",
                  spermBankPhone: sperm.phone || "",
                  coordinatorName: sperm.coordinator || "",
                  spermBankWebsite: sperm.website || "",
                  spermBankEmail: sperm.email || "",
                  accountId: sperm.accountId || "",
                  junctionId: sperm.junctionId || "",
                  index: spermData.length + index + 1
                }))
              );
            } else {
              spermData.push({
                id: crypto.randomUUID(),
                spermBankName: this.contactObj.spermBanksWithSDN.additionalBanks.bankName || this.contactObj.spermBanksWithSDN.additionalBanks.spermBankName || "",
                spermBankPhone: this.contactObj.spermBanksWithSDN.additionalBanks.phone || "",
                coordinatorName: this.contactObj.spermBanksWithSDN.additionalBanks.coordinator || "",
                spermBankWebsite: this.contactObj.spermBanksWithSDN.additionalBanks.website || "",
                spermBankEmail: this.contactObj.spermBanksWithSDN.additionalBanks.email || "",
                accountId: this.contactObj.spermBanksWithSDN.additionalBanks.accountId || "",
                junctionId: this.contactObj.spermBanksWithSDN.additionalBanks.junctionId || "",
                index: spermData.length + 1
              });
            }
          }
        }
      }
      this.formData.spermBank = spermData;
      this.formData.noSpermChecked = this.contactObj.noSpermChecked || false;
    }

    // Clinics for both egg and sperm donors
    let clinicData = [];
    if (this.contactObj.donorType === "sperm") {
      if (this.contactObj.isSkipped === true) {
        if (this.contactObj.clinics) {
          if (Array.isArray(this.contactObj.clinics)) {
            clinicData = this.contactObj.clinics.map((clinic, index) => ({
              id: clinic.id || crypto.randomUUID(),
              clinicName: clinic.name || clinic.clinicName || "",
              phone: clinic.phone || "",
              coordinatorName: clinic.coordinator || "",
              website: clinic.website || "",
              cityState: clinic.cityState || "",
              coordinatorEmail: clinic.email || "",
              accountId: clinic.accountId || "",
              junctionId: clinic.junctionId || "",
              index: index + 1
            }));
          } else {
            clinicData = [{
              id: crypto.randomUUID(),
              clinicName: this.contactObj.clinics.name || this.contactObj.clinics.clinicName || "",
              phone: this.contactObj.clinics.phone || "",
              coordinatorName: this.contactObj.clinics.coordinator || "",
              website: this.contactObj.clinics.website || "",
              cityState: this.contactObj.clinics.cityState || "",
              coordinatorEmail: this.contactObj.clinics.email || "",
              accountId: this.contactObj.clinics.accountId || "",
              junctionId: this.contactObj.clinics.junctionId || "",
              index: 1
            }];
          }
        }
      } else {
        if (this.contactObj.clinicInfoWithSDN) {
          if (this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex) {
            if (Array.isArray(this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex)) {
              clinicData = clinicData.concat(
                this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex.map((clinic, index) => ({
                  id: clinic.id || crypto.randomUUID(),
                  clinicName: clinic.bankName || clinic.clinicName || "",
                  phone: clinic.phone || "",
                  coordinatorName: clinic.coordinator || "",
                  website: clinic.website || "",
                  cityState: clinic.cityState || "",
                  coordinatorEmail: clinic.email || "",
                  accountId: clinic.spermclinicId || "",
                  junctionId: clinic.junctionId || "",
                  index: clinicData.length + index + 1
                }))
              );
            } else {
              clinicData.push({
                id: crypto.randomUUID(),
                clinicName: this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex.bankName || this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex.clinicName || "",
                phone: this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex.phone || "",
                coordinatorName: this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex.coordinator || "",
                website: this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex.website || "",
                cityState: this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex.cityState || "",
                coordinatorEmail: this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex.email || "",
                accountId: this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex.spermclinicId || "",
                junctionId: this.contactObj.clinicInfoWithSDN.primaryBanksListFromApex.junctionId || "",
                index: clinicData.length + 1
              });
            }
          }
          if (this.contactObj.clinicInfoWithSDN.additionalBanks) {
            if (Array.isArray(this.contactObj.clinicInfoWithSDN.additionalBanks)) {
              clinicData = clinicData.concat(
                this.contactObj.clinicInfoWithSDN.additionalBanks.map((clinic, index) => ({
                  id: clinic.id || crypto.randomUUID(),
                  clinicName: clinic.bankName || clinic.clinicName || "",
                  phone: clinic.phone || "",
                  coordinatorName: clinic.coordinator || "",
                  website: clinic.website || "",
                  cityState: clinic.cityState || "",
                  coordinatorEmail: clinic.email || "",
                  accountId: clinic.accountId || "",
                  junctionId: clinic.junctionId || "",
                  index: clinicData.length + index + 1
                }))
              );
            } else {
              clinicData.push({
                id: crypto.randomUUID(),
                clinicName: this.contactObj.clinicInfoWithSDN.additionalBanks.bankName || this.contactObj.clinicInfoWithSDN.additionalBanks.clinicName || "",
                phone: this.contactObj.clinicInfoWithSDN.additionalBanks.phone || "",
                coordinatorName: this.contactObj.clinicInfoWithSDN.additionalBanks.coordinator || "",
                website: this.contactObj.clinicInfoWithSDN.additionalBanks.website || "",
                cityState: this.contactObj.clinicInfoWithSDN.additionalBanks.cityState || "",
                coordinatorEmail: this.contactObj.clinicInfoWithSDN.additionalBanks.email || "",
                accountId: this.contactObj.clinicInfoWithSDN.additionalBanks.accountId || "",
                junctionId: this.contactObj.clinicInfoWithSDN.additionalBanks.junctionId || "",
                index: clinicData.length + 1
              });
            }
          }
        }
      }
    } else if (this.contactObj.donorType === "egg") {
      if (this.contactObj.isSkipped === true) {
        if (this.contactObj.clinicsWithoutCode) {
          if (Array.isArray(this.contactObj.clinicsWithoutCode)) {
            clinicData = this.contactObj.clinicsWithoutCode.map((clinic, index) => ({
              id: clinic.id || crypto.randomUUID(),
              clinicName: clinic.clinicName || "",
              phone: clinic.phone || "",
              coordinatorName: clinic.coordinatorName || "",
              website: clinic.website || "",
              cityState: clinic.cityState || "",
              coordinatorEmail: clinic.coordinatorEmail || "",
              index: index + 1
            }));
          } else {
            clinicData = [{
              id: crypto.randomUUID(),
              clinicName: this.contactObj.clinicsWithoutCode.clinicName || "",
              phone: this.contactObj.clinicsWithoutCode.phone || "",
              coordinatorName: this.contactObj.clinicsWithoutCode.coordinatorName || "",
              website: this.contactObj.clinicsWithoutCode.website || "",
              cityState: this.contactObj.clinicsWithoutCode.cityState || "",
              coordinatorEmail: this.contactObj.clinicsWithoutCode.coordinatorEmail || "",
              index: 1
            }];
          }
        }
      } else {
        if (this.contactObj.clinicsWithCodes) {
          if (this.contactObj.clinicsWithCodes.donationOutcomesListFromApex) {
            if (Array.isArray(this.contactObj.clinicsWithCodes.donationOutcomesListFromApex)) {
              clinicData = clinicData.concat(
                this.contactObj.clinicsWithCodes.donationOutcomesListFromApex.map((clinic, index) => ({
                  id: clinic.id || crypto.randomUUID(),
                  clinicName: clinic.clinicName || "",
                  phone: clinic.phone || "",
                  coordinatorName: clinic.coordinatorName || "",
                  website: clinic.website || "",
                  cityState: clinic.cityState || "",
                  coordinatorEmail: clinic.coordinatorEmail || "",
                  index: clinicData.length + index + 1
                }))
              );
            } else {
              clinicData.push({
                id: crypto.randomUUID(),
                clinicName: this.contactObj.clinicsWithCodes.donationOutcomesListFromApex.clinicName || "",
                phone: this.contactObj.clinicsWithCodes.donationOutcomesListFromApex.phone || "",
                coordinatorName: this.contactObj.clinicsWithCodes.donationOutcomesListFromApex.coordinatorName || "",
                website: this.contactObj.clinicsWithCodes.donationOutcomesListFromApex.website || "",
                cityState: this.contactObj.clinicsWithCodes.donationOutcomesListFromApex.cityState || "",
                coordinatorEmail: this.contactObj.clinicsWithCodes.donationOutcomesListFromApex.coordinatorEmail || "",
                index: clinicData.length + 1
              });
            }
          }
          if (this.contactObj.clinicsWithCodes.additionalClinics) {
            if (Array.isArray(this.contactObj.clinicsWithCodes.additionalClinics)) {
              clinicData = clinicData.concat(
                this.contactObj.clinicsWithCodes.additionalClinics.map((clinic, index) => ({
                  id: clinic.id || crypto.randomUUID(),
                  clinicName: clinic.clinicName || "",
                  phone: clinic.phone || "",
                  coordinatorName: clinic.coordinatorName || "",
                  website: clinic.website || "",
                  cityState: clinic.cityState || "",
                  coordinatorEmail: clinic.coordinatorEmail || "",
                  index: clinicData.length + index + 1
                }))
              );
            } else {
              clinicData.push({
                id: crypto.randomUUID(),
                clinicName: this.contactObj.clinicsWithCodes.additionalClinics.clinicName || "",
                phone: this.contactObj.clinicsWithCodes.additionalClinics.phone || "",
                coordinatorName: this.contactObj.clinicsWithCodes.additionalClinics.coordinatorName || "",
                website: this.contactObj.clinicsWithCodes.additionalClinics.website || "",
                cityState: this.contactObj.clinicsWithCodes.additionalClinics.cityState || "",
                coordinatorEmail: this.contactObj.clinicsWithCodes.additionalClinics.coordinatorEmail || "",
                index: clinicData.length + 1
              });
            }
          }
        }
      }
    }
    this.formData.clinics = clinicData;
    this.formData.noClinicChecked = this.contactObj.noClinicChecked || false;

    // Attorneys for egg donors
    if (this.contactObj.donorType === "egg") {
      let attorneyData = [];
      if (this.contactObj.isSkipped === true) {
        if (this.contactObj.attorneysWithoutCode) {
          if (Array.isArray(this.contactObj.attorneysWithoutCode)) {
            attorneyData = this.contactObj.attorneysWithoutCode.map((attorney, index) => ({
              id: attorney.id || crypto.randomUUID(),
              attorneyName: attorney.AttorneyName || "",
              phone: attorney.phone || "",
              lawFirm: attorney.lawFirm || "",
              website: attorney.website || "",
              cityState: attorney.cityState || "",
              email: attorney.email || "",
              index: index + 1
            }));
          } else {
            attorneyData = [{
              id: crypto.randomUUID(),
              attorneyName: this.contactObj.attorneysWithoutCode.AttorneyName || "",
              phone: this.contactObj.attorneysWithoutCode.phone || "",
              lawFirm: this.contactObj.attorneysWithoutCode.lawFirm || "",
              website: this.contactObj.attorneysWithoutCode.website || "",
              cityState: this.contactObj.attorneysWithoutCode.cityState || "",
              email: this.contactObj.attorneysWithoutCode.email || "",
              index: 1
            }];
          }
        }
      } else {
        if (this.contactObj.attorneysWithCodes) {
          if (this.contactObj.attorneysWithCodes.donationOutcomesListFromApex) {
            if (Array.isArray(this.contactObj.attorneysWithCodes.donationOutcomesListFromApex)) {
              attorneyData = attorneyData.concat(
                this.contactObj.attorneysWithCodes.donationOutcomesListFromApex.map((attorney, index) => ({
                  id: attorney.id || crypto.randomUUID(),
                  attorneyName: attorney.AttorneyName || "",
                  phone: attorney.phone || "",
                  lawFirm: attorney.lawFirm || "",
                  website: attorney.website || "",
                  cityState: attorney.cityState || "",
                  email: attorney.email || "",
                  index: attorneyData.length + index + 1
                }))
              );
            } else {
              attorneyData.push({
                id: crypto.randomUUID(),
                attorneyName: this.contactObj.attorneysWithCodes.donationOutcomesListFromApex.AttorneyName || "",
                phone: this.contactObj.attorneysWithCodes.donationOutcomesListFromApex.phone || "",
                lawFirm: this.contactObj.attorneysWithCodes.donationOutcomesListFromApex.lawFirm || "",
                website: this.contactObj.attorneysWithCodes.donationOutcomesListFromApex.website || "",
                cityState: this.contactObj.attorneysWithCodes.donationOutcomesListFromApex.cityState || "",
                email: this.contactObj.attorneysWithCodes.donationOutcomesListFromApex.email || "",
                index: attorneyData.length + 1
              });
            }
          }
          if (this.contactObj.attorneysWithCodes.additionalAttorneys) {
            if (Array.isArray(this.contactObj.attorneysWithCodes.additionalAttorneys)) {
              attorneyData = attorneyData.concat(
                this.contactObj.attorneysWithCodes.additionalAttorneys.map((attorney, index) => ({
                  id: attorney.id || crypto.randomUUID(),
                  attorneyName: attorney.attorneyName || "",
                  phone: attorney.phone || "",
                  lawFirm: attorney.lawFirm || "",
                  website: attorney.website || "",
                  cityState: attorney.cityState || "",
                  email: attorney.email || "",
                  index: attorneyData.length + index + 1
                }))
              );
            } else {
              attorneyData.push({
                id: crypto.randomUUID(),
                attorneyName: this.contactObj.attorneysWithCodes.additionalAttorneys.attorneyName || "",
                phone: this.contactObj.attorneysWithCodes.additionalAttorneys.phone || "",
                lawFirm: this.contactObj.attorneysWithCodes.additionalAttorneys.lawFirm || "",
                website: this.contactObj.attorneysWithCodes.additionalAttorneys.website || "",
                cityState: this.contactObj.attorneysWithCodes.additionalAttorneys.cityState || "",
                email: this.contactObj.attorneysWithCodes.additionalAttorneys.email || "",
                index: attorneyData.length + 1
              });
            }
          }
        }
      }
      this.formData.attorneys = attorneyData;
      this.formData.noAttorneyChecked = this.contactObj.noAttorneyChecked || false;
    }

    // Recipients for both egg and sperm donors
    let recipientData = [];
    if (this.contactObj.donorType === "sperm") {
      if (this.contactObj.recipients) {
        if (Array.isArray(this.contactObj.recipients)) {
          recipientData = this.contactObj.recipients.map((recipient, index) => ({
            id: recipient.id || crypto.randomUUID(),
            recipient2FirstName: recipient.recipient2FirstName || "",
            recipient2LastName: recipient.recipient2LastName || "",
            phone: recipient.phone || "",
            email: recipient.email || "",
            additionalInfo: recipient.additionalInfo || "",
            RecipientNumber: index + 1
          }));
        } else {
          recipientData = [{
            id: crypto.randomUUID(),
            recipient2FirstName: this.contactObj.recipients.recipient2FirstName || "",
            recipient2LastName: this.contactObj.recipients.recipient2LastName || "",
            phone: this.contactObj.recipients.phone || "",
            email: this.contactObj.recipients.email || "",
            additionalInfo: this.contactObj.recipients.additionalInfo || "",
            RecipientNumber: 1
          }];
        }
      }
    } else if (this.contactObj.donorType === "egg") {
      if (this.contactObj.isSkipped === true) {
        if (this.contactObj.recipientsWithoutCode) {
          if (Array.isArray(this.contactObj.recipientsWithoutCode)) {
            recipientData = this.contactObj.recipientsWithoutCode.map((recipient, index) => ({
              id: recipient.id || crypto.randomUUID(),
              recipient2FirstName: recipient.recipient2FirstName || "",
              recipient2LastName: recipient.recipient2LastName || "",
              phone: recipient.phone || "",
              email: recipient.email || "",
              additionalInfo: recipient.additionalInfo || "",
              RecipientNumber: index + 1
            }));
          } else {
            recipientData = [{
              id: crypto.randomUUID(),
              recipient2FirstName: this.contactObj.recipientsWithoutCode.recipient2FirstName || "",
              recipient2LastName: this.contactObj.recipientsWithoutCode.recipient2LastName || "",
              phone: this.contactObj.recipientsWithoutCode.phone || "",
              email: this.contactObj.recipientsWithoutCode.email || "",
              additionalInfo: this.contactObj.recipientsWithoutCode.additionalInfo || "",
              RecipientNumber: 1
            }];
          }
        }
      } else {
        if (this.contactObj.recipientsWithCodes) {
          if (this.contactObj.recipientsWithCodes.donationOutcomesListFromApex) {
            if (Array.isArray(this.contactObj.recipientsWithCodes.donationOutcomesListFromApex)) {
              recipientData = recipientData.concat(
                this.contactObj.recipientsWithCodes.donationOutcomesListFromApex.map((recipient, index) => ({
                  id: recipient.id || crypto.randomUUID(),
                  recipient2FirstName: recipient.recipient2FirstName || "",
                  recipient2LastName: recipient.recipient2LastName || "",
                  phone: recipient.phone || "",
                  email: recipient.email || "",
                  additionalInfo: recipient.additionalInfo || "",
                  RecipientNumber: recipientData.length + index + 1
                }))
              );
            } else {
              recipientData.push({
                id: crypto.randomUUID(),
                recipient2FirstName: this.contactObj.recipientsWithCodes.donationOutcomesListFromApex.recipient2FirstName || "",
                recipient2LastName: this.contactObj.recipientsWithCodes.donationOutcomesListFromApex.recipient2LastName || "",
                phone: this.contactObj.recipientsWithCodes.donationOutcomesListFromApex.phone || "",
                email: this.contactObj.recipientsWithCodes.donationOutcomesListFromApex.email || "",
                additionalInfo: this.contactObj.recipientsWithCodes.donationOutcomesListFromApex.additionalInfo || "",
                RecipientNumber: recipientData.length + 1
              });
            }
          }
          if (this.contactObj.recipientsWithCodes.additionalRecipients) {
            if (Array.isArray(this.contactObj.recipientsWithCodes.additionalRecipients)) {
              recipientData = recipientData.concat(
                this.contactObj.recipientsWithCodes.additionalRecipients.map((recipient, index) => ({
                  id: recipient.id || crypto.randomUUID(),
                  recipient2FirstName: recipient.recipient2FirstName || "",
                  recipient2LastName: recipient.recipient2LastName || "",
                  phone: recipient.phone || "",
                  email: recipient.email || "",
                  additionalInfo: recipient.additionalInfo || "",
                  RecipientNumber: recipientData.length + index + 1
                }))
              );
            } else {
              recipientData.push({
                id: crypto.randomUUID(),
                recipient2FirstName: this.contactObj.recipientsWithCodes.additionalRecipients.recipient2FirstName || "",
                recipient2LastName: this.contactObj.recipientsWithCodes.additionalRecipients.recipient2LastName || "",
                phone: this.contactObj.recipientsWithCodes.additionalRecipients.phone || "",
                email: this.contactObj.recipientsWithCodes.additionalRecipients.email || "",
                additionalInfo: this.contactObj.recipientsWithCodes.additionalRecipients.additionalInfo || "",
                RecipientNumber: recipientData.length + 1
              });
            }
          }
        }
      }
    }
    this.formData.recipients = recipientData;
    this.formData.noRecipientChecked = this.contactObj.noRecipientChecked || false;*/
  }

  generateId() {
    return crypto.randomUUID();
  }

  loadJsPDFLibrary() {
    this.jsPDFInitialized = true;
    loadScript(this, jsPDFLibrary)
      .then(() => {
        console.log("jsPDF library loaded successfully");
      })
      .catch((error) => {
        console.error("Error loading jsPDF library", error);
        this.showToast("Error", "Failed to load PDF generation library.", "error");
      });
  }

  initializeCanvas() {
    this.canvas = this.template.querySelector(".signature-canvas");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.setupCanvas();
    //this.drawRefreshIcon();
  }

  setupCanvas() {
    this.ctx.strokeStyle = "#000000";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  /*drawRefreshIcon() {
    const { x, y, width, height } = this.iconBounds;
    this.ctx.save();

    // Clear the icon area
    this.ctx.clearRect(x, y, width, height);

    // Draw background
    this.ctx.fillStyle = "#f3f4f6";
    this.ctx.fillRect(x, y, width, height);

    // Draw refresh icon
    this.ctx.strokeStyle = "#6b7280";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(x + width / 2, y + height / 2, 6, 0, 1.5 * Math.PI);
    this.ctx.stroke();

    // Draw arrow
    this.ctx.beginPath();
    this.ctx.moveTo(x + 4, y + height / 2);
    this.ctx.lineTo(x + 7, y + height / 2 - 3);
    this.ctx.lineTo(x + 7, y + height / 2 + 3);
    this.ctx.closePath();
    this.ctx.fillStyle = "#6b7280";
    this.ctx.fill();

    this.ctx.restore();
  }*/

  getCoordinates(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    if (event.touches && event.touches.length > 0) {
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    }
  }

  isClickInIconBounds(event) {
    const { x, y } = this.getCoordinates(event);
    const { x: iconX, y: iconY, width, height } = this.iconBounds;
    return x >= iconX && x <= iconX + width && y >= iconY && y <= iconY + height;
  }

  handleMouseDown(event) {
    event.preventDefault();
    if (this.isClickInIconBounds(event)) {
      this.clearSignature();
    } else {
      this.startDrawing(event);
    }
  }

  handleTouchStart(event) {
    event.preventDefault();
    if (this.isClickInIconBounds(event)) {
      this.clearSignature();
    } else {
      this.startDrawing(event);
    }
  }

  startDrawing(event) {
    this.isDrawing = true;
    this.isEmpty = false;
    const { x, y } = this.getCoordinates(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  handleMouseMove(event) {
    this.draw(event);
  }

  handleTouchMove(event) {
    this.draw(event);
  }

  draw(event) {
    event.preventDefault();
    if (!this.isDrawing) return;

    const { x, y } = this.getCoordinates(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  handleMouseUp(event) {
    this.stopDrawing(event);
  }

  handleMouseLeave(event) {
    this.stopDrawing(event);
  }

  handleTouchEnd(event) {
    this.stopDrawing(event);
  }

  stopDrawing(event) {
    event.preventDefault();
    if (!this.isDrawing) return;

    this.isDrawing = false;
    this.signature = this.canvas.toDataURL();
   // this.drawRefreshIcon();
  }

  clearSignature() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.isEmpty = true;
    this.signature = "";
   // this.drawRefreshIcon();
  }

  handleConfirmationChange(event) {
    this.isConfirmed = event.target.checked;
  }

  handleBack() {
    // this.dispatchEvent(
    //   new CustomEvent("back", {
    //     detail: this.contactObj,
    //   }),
    // );
    debugger
    const backEvent = new CustomEvent('back',{detail:''});
     this.dispatchEvent(backEvent);
  }

  async handleNext() {

      let isValid = true;
            this.template.querySelectorAll('lightning-input').forEach(input => {
                const fieldsMap = new Map([
                    ['confirmation', 'Please confirm that you agree to the terms of the HIPAA Release Form']
                ]);
                
                if (fieldsMap.has(input.name) && input.name =="confirmation" && input.checked == false) {
                    input.setCustomValidity(fieldsMap.get(input.name));
                    input.reportValidity();
                    isValid = false;
                }
                 else {
                    input.setCustomValidity('');
                    input.reportValidity();
                }
            });

            if (!isValid) {
                return;
            }


    if (!this.signature || this.isEmpty) {
        this.signerror= true;
    //  this.showToast("Error", "Please provide your signature before proceeding.", "error");
      return;
    }

    if (!this.jsPDFInitialized) {
      this.showToast("Error", "PDF generation library not initialized.", "error");
      return;
    }

    this.isLoading = true;

    try {
      await this.generateAndSavePDF();

      const formSubmissionData = {
        ...this.formData,
        signature: this.signature,
        submissionDate: new Date().toISOString(),
        isConfirmed: this.isConfirmed,
      };

      this.dispatchEvent(
        new CustomEvent("next", {
          detail: formSubmissionData,
        }),
      );

      this.showToast("Success", "HIPAA Release Form submitted and attached successfully.", "success");
    } catch (error) {
      console.error("Error generating or saving PDF:", error);
      this.showToast("Error", "Failed to generate or attach PDF.", "error");
    } finally {
      this.isLoading = false;
    }
  }

  async generateAndSavePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yOffset = 20;

    // Add Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("HIPAA Release Form", 20, yOffset);
    yOffset += 15;

    // Add Description
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const description = [
      "We have generated a HIPAA release form to facilitate secure communication with the",
      "professional partners you've previously worked with. This release is essential for us",
      "to safely locate and link the families you've supported, ensuring they receive important",
      "health updates.",
    ];

    description.forEach((line) => {
      doc.text(line, 20, yOffset);
      yOffset += 6;
    });
    yOffset += 10;

    // Patient Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", 20, yOffset);
    yOffset += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const patientInfo = [
      `Name: ${this.formData.name}`,
      `DOB: ${this.formData.dob}`,
      `Address: ${this.formData.address}`,
      `Phone: ${this.formData.phone}`,
      `Email: ${this.formData.email}`,
    ];

    patientInfo.forEach((info) => {
      doc.text(info, 20, yOffset);
      yOffset += 6;
    });
    yOffset += 10;

    // Authorization Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Authorization for Release of Protected Health Information", 20, yOffset);
    yOffset += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `I, ${this.formData.name}, authorize the release of my protected health information as described below:`,
      20,
      yOffset,
    );
    yOffset += 10;

    doc.setFont("helvetica", "bold");
    doc.text("1. Covered Entities Authorized to Release Information:", 20, yOffset);
    yOffset += 8;

    doc.setFont("helvetica", "normal");
    if (this.formData.showAgenciesSection) {
      doc.text("Agencies:", 25, yOffset);
      yOffset += 6;
      this.formData.agencies.forEach((agency) => {
        doc.text(`${agency.index}. ${agency.agencyName}`, 30, yOffset);
        yOffset += 6;
      });
    }

    if (this.formData.showSpermBanksSection) {
      doc.text("Sperm Banks:", 25, yOffset);
      yOffset += 6;
      this.formData.spermBank.forEach((sperm) => {
        doc.text(`${sperm.index}. ${sperm.spermBankName}`, 30, yOffset);
        yOffset += 6;
      });
    }

    doc.text("Clinics:", 25, yOffset);
    yOffset += 6;
    this.formData.clinics.forEach((clinic) => {
      doc.text(`${clinic.index}. ${clinic.clinicName}`, 30, yOffset);
      yOffset += 6;
    });

    if (this.formData.showAttorneySection) {
      doc.text("Attorneys:", 25, yOffset);
      yOffset += 6;
      this.formData.attorneys.forEach((attorney) => {
        doc.text(`${attorney.index}. ${attorney.attorneyName}`, 30, yOffset);
        yOffset += 6;
      });
    }

    if (this.formData.showRecipientsection) {
      doc.text("Recipients:", 25, yOffset);
      yOffset += 6;
      this.formData.recipients.forEach((recipient) => {
        doc.text(`${recipient.RecipientNumber}. ${recipient.recipient2FirstName} ${recipient.recipient2LastName}`, 30, yOffset);
        yOffset += 6;
      });
    }
    yOffset += 8;

    doc.setFont("helvetica", "bold");
    doc.text("2. Information to be Released:", 20, yOffset);
    yOffset += 8;

    doc.setFont("helvetica", "normal");
    const infoToRelease = [
      "All medical records, reports, and information related to my egg donation process,",
      "including but not limited to medical history, laboratory results, genetic screening",
      "results, and any other relevant information.",
    ];

    infoToRelease.forEach((line) => {
      doc.text(line, 20, yOffset);
      yOffset += 6;
    });
    yOffset += 15;

    // Signature
    doc.setFont("helvetica", "bold");
    doc.text("Signature:", 20, yOffset);
    yOffset += 10;

    if (this.signature) {
      try {
        doc.addImage(this.signature, "PNG", 20, yOffset, 80, 40);
        yOffset += 45;
      } catch (error) {
        console.error("Error adding signature to PDF:", error);
      }
    }

    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yOffset);

    // Convert PDF to Base64
    const pdfBase64 = doc.output("datauristring").split(",")[1];

    // Call Apex to save PDF
    const fileName = `HIPAA_Release_Form_${this.formData.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    await savePDFToContact({
      contactId: this.contactObj?.donorId || " ",
      pdfBase64: pdfBase64,
      fileName: fileName,
    });
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
    });
    this.dispatchEvent(event);
  }
}