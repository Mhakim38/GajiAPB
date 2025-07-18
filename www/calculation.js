import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, doc, updateDoc, persistentLocalCache } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { firebaseConfig } from './secret/config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Salary rates and constants
const StaffSalary = 1700;
const PartTimeSalary = 8.17;
const PH = 65.40;
const OT = 12.26;
const UPL = 65.40;

// Salary Deduction
const S_KWSP = 187;
const S_socso = 8.25;
const S_EIS = 3.30;

// Calculation functions
const calcStaffOT = (salary) => salary - S_KWSP - S_socso - S_EIS;
const calcPartTime = (hours) => PartTimeSalary * hours;
const publlicHoliday = (salary, days) => salary + (PH * days);
const overTime = (salary, hours) => salary + (OT * hours);
const unpaidLeave = (salary, days) => salary - (UPL * days);

export { calcStaffOT, calcPartTime, publlicHoliday, overTime, unpaidLeave, db, addDoc, getDoc , collection, doc, updateDoc, app, persistentLocalCache, S_EIS, S_socso, S_KWSP };
