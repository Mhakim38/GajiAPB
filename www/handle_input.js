import { calcStaffOT, calcPartTime, publlicHoliday, overTime, unpaidLeave, db, addDoc, collection } from './calculation.js';

document.addEventListener("DOMContentLoaded", () => {
  // Show/hide input boxes based on checkboxes
  const toggleVisibility = (checkboxId, inputId) => {
    const checkbox = document.getElementById(checkboxId);
    const input = document.getElementById(inputId);
    if (checkbox && input) {
      checkbox.addEventListener("change", (event) => {
        input.classList.toggle("hidden", !event.target.checked);
      });
    }
  };

  toggleVisibility("publicHoliday", "publicHolidayDays");
  toggleVisibility("overtime", "overtimeHours");
  toggleVisibility("unpaidLeave", "unpaidLeaveDays");

  // Button click event for staff salary
  const calcStaffBtn = document.getElementById("calcStaffBtn");
  if (calcStaffBtn) {
    calcStaffBtn.addEventListener("click", async () => {
      let adjustedSalary = 1700; // Pre-defined staff salary
      if (document.getElementById("publicHoliday").checked) {
        const days = parseFloat(document.getElementById("publicHolidayDays").value) || 0;
        adjustedSalary = publlicHoliday(adjustedSalary, days);
      }
      if (document.getElementById("overtime").checked) {
        const hours = parseFloat(document.getElementById("overtimeHours").value) || 0;
        adjustedSalary = overTime(adjustedSalary, hours);
      }
      if (document.getElementById("unpaidLeave").checked) {
        const days = parseFloat(document.getElementById("unpaidLeaveDays").value) || 0;
        adjustedSalary = unpaidLeave(adjustedSalary, days);
      }

      const staffOT = calcStaffOT(adjustedSalary).toFixed(2);
      document.getElementById("staffOT").textContent = staffOT;

      // Save record to Firestore
      const record = { basicSalary: 1700, adjustedSalary, staffOT, timestamp: new Date().toISOString() };
      try {
        const docRef = await addDoc(collection(db, "salaries"), record);
        console.log("Record saved with ID:", docRef.id);
      } catch (error) {
        console.error("Error saving record:", error);
      }
    });
  }

  // Button click event for part-time salary
  const calcPartTimeBtn = document.getElementById("calcPartTimeBtn");
  if (calcPartTimeBtn) {
    calcPartTimeBtn.addEventListener("click", () => {
      const hours = parseFloat(document.getElementById("partTimeHours").value);
      if (isNaN(hours)) {
        alert("Please enter a valid number of hours");
        return;
      }

      const partTime = calcPartTime(hours).toFixed(2);
      document.getElementById("partTime").textContent = partTime;
    });
  }
});
