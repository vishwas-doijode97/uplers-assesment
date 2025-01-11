import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-app-file-upload',
  imports: [CommonModule],
  templateUrl: './app-file-upload.component.html',
  styleUrl: './app-file-upload.component.css'
})
export class AppFileUploadComponent {
  @ViewChild('inputElemnt') inputElemnt!: ElementRef;
  actualHierachy: any = {
    Admin: 'Root',
    Manager: ['Admin', 'Manager'],
    Caller: 'Manager'
  }
  employeeList: any[] = [];
  headers: any;
  errorLogs: any = {
    Admin: { title: 'Only Admin will report to Root', errors: [] },
    Manager: { title: 'Managers can only report to other managers or admin', errors: [] },
    Caller: { title: 'Caller can only report manager', errors: [] },
    Default: { title: 'All users will report to 1 parent user at a time', errors: [] }
  };
  errorHeaders: string[] = [];

  uploadProcessCSV() {
    const file = this.inputElemnt.nativeElement.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.convertCSVToJSON(reader);
    }
    reader.readAsText(file)
  }

  convertCSVToJSON(reader: FileReader) {
    let lines = (reader.result as string).split('\n');
    let headers: any[] = lines[0].split(',');
    for (let i = 1; i < lines.length; i++) {
      let obj: any = {}
      let person = lines[i].split(',');
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j].trim()] = person[j].includes('\r') ? person[j].replaceAll('\r', '') : person[j];
      }
      this.employeeList.push(obj);
      this.employeeList = this.employeeList.map(ele => ({
        ...ele,
        'ReportingPersonRole': this.employeeList.find(person => person.ReportsTo.includes(';') ? null : ele.ReportsTo === person.Email)?.['Role'],
        'ReportingPersonName': this.employeeList.find(person => person.ReportsTo.includes(';') ? null : ele.ReportsTo === person.Email)?.['FullName'],
        'actualReportingRole': this.actualHierachy[ele.Role]
      }))
      this.headers = Object.keys(this.employeeList[0])
      this.checkReportingLevelValidations()
    }
  }

  checkReportingLevelValidations() {
    this.employeeList = this.employeeList.map(ele =>
    (ele.ReportingPersonRole && this.actualHierachy[ele.Role].includes(ele?.ReportingPersonRole) ?
      { ...ele, status: true } : { ...ele, status: false }
    ));
    this.showErrorLogs();
  }
  showErrorLogs() {
    this.resetLogs();
    this.employeeList.forEach((ele, i) => {
      if (ele.status === false) {
        const { Role, ReportingPersonRole, ReportsTo, ReportingPersonName, FullName, Email } = ele;
        const errorMessage = `Row ${i + 1} (${Email})*: ${FullName} is a ${Role} but reports to ${ReportingPersonRole} (${ReportingPersonName}).`;

        if (ReportsTo.includes(';')) {
          this.errorLogs[ele.Role].errors.push(
            this.isAdminFound(ele.ReportsTo.split(';')) ?
              `Row ${i + 1} (${ele.Email})*:has an additional problem of multiple parents, but if we consider each parent individually, 
                     at least one is an Admin (${this.isAdminFound(ele.ReportsTo.split(';'))?.['FullName']})—which also violates the rule (${ele.Role} → ${this.isAdminFound(ele.ReportsTo.split(';'))?.['Role']} is not allowed).
                     `: `Row ${i + 1} (${ele.Email})*:has an additional problem of multiple parents`
          )

          this.errorLogs['Default'].errors.push(
            `Row ${i + 1} (${ele.Email})*  ${ele.FullName} is a ${ele.Role} but reports to two emails:` + ele.ReportsTo
          )
          return;
        }

        let hasLoggedError = false;

        if (Role === 'Admin') {
          if (ReportingPersonRole !== 'Root') {
            this.errorLogs[Role]?.errors.push(`${errorMessage} Admin can only report to Root.`);
            hasLoggedError = true;
          }
        }

        if (!hasLoggedError && Role === 'Manager') {
          if (ReportingPersonRole === 'Root') {
            this.errorLogs['Admin']?.errors.push(
              `Row ${i + 1} (${ele.Email})*: ${ele.FullName} is a ${ele.Role} but reports to ${ele.ReportingPersonRole} (${ele.ReportingPersonName}).`
            )
          }
          if (ReportingPersonRole !== 'Manager' && ReportingPersonRole !== 'Admin' && ReportingPersonRole !== 'Root') {
            this.errorLogs[Role]?.errors.push(`${errorMessage} Managers must report to Managers or Admins.`);
            hasLoggedError = true;
          }
        }

        if (!hasLoggedError && Role === 'Caller') {
          if (ReportingPersonRole !== 'Manager') {
            this.errorLogs[Role]?.errors.push(`${errorMessage} Callers must report to Managers.`);
            hasLoggedError = true;
          }
        }

        if (!hasLoggedError && Role === 'Admin' && ReportingPersonRole === 'Manager') {
          this.errorLogs[Role]?.errors.push(`Row ${i + 1} (${Email})*: ${FullName} is an Admin and can have multiple Managers reporting to them.`);
        }
      }
    });
  
    this.errorHeaders = Object.keys(this.errorLogs)
  }


  isAdminFound(list: any[]): any {
    return this.employeeList.filter((ele, i) => (list.includes(ele.Email))).filter(ele => ele.Role === 'Admin')[0];
  }

  resetLogs() {
    this.errorLogs = {
      Admin: { title: 'Only Admin will report to Root', errors: [] },
      Manager: { title: 'Managers can only report to other managers or admin', errors: [] },
      Caller: { title: 'Caller can only report manager', errors: [] },
      Default: { title: 'All users will report to 1 parent user at a time', errors: [] }
    };
  }
}
