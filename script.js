const form = document.getElementById("enrollment-form");
const statusBox = document.getElementById("form-status");
const recordsBody = document.getElementById("records-body");
const courseSelect = document.getElementById("course");
const majorField = document.getElementById("major-field");
const majorSelect = document.getElementById("major");

let enrollmentCount = 0;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Rules per field. `required` and `min` follow the assignment specs. */
const rules = {
  studentId:  { label: "Student ID",  required: true,  min: 5 },
  prefix:     { label: "Prefix",      required: false, min: 2 },
  firstName:  { label: "First name",  required: true,  min: 3 },
  middleName: { label: "Middle name", required: false, min: 2 },
  lastName:   { label: "Last name",   required: true,  min: 2 },
  suffix:     { label: "Suffix",      required: false, min: 2 },
  email:      { label: "Email",       required: true,  type: "email" },
  course:     { label: "Course",      required: true,  type: "select" },
  major:      { label: "Major",       required: true,  type: "select" },
  yearLevel:  { label: "Year level",  required: true,  type: "select" }
};

/* Returns an error message, or "" if the field is valid. */
function validateField(name) {
  const rule = rules[name];
  const value = form.elements[name].value.trim();

  // Major only applies when the course is BSIT
  if (name === "major" && courseSelect.value !== "BSIT") return "";

  if (rule.type === "select") {
    return value === "" ? `Select a ${rule.label.toLowerCase()}.` : "";
  }

  if (value === "") {
    return rule.required ? `${rule.label} is required.` : "";
  }

  if (rule.min && value.length < rule.min) {
    return `${rule.label} must be at least ${rule.min} characters.`;
  }

  if (rule.type === "email" && !emailPattern.test(value)) {
    return "Enter a valid email address, like name@example.com.";
  }

  return "";
}

function showError(name, message) {
  const field = form.elements[name];
  document.getElementById(`${name}-error`).textContent = message;
  field.setAttribute("aria-invalid", "true");
}

function clearError(name) {
  const field = form.elements[name];
  document.getElementById(`${name}-error`).textContent = "";
  field.removeAttribute("aria-invalid");
}

function hideStatus() {
  statusBox.hidden = true;
  statusBox.textContent = "";
}

/* Show or hide the Major dropdown depending on the course */
function updateMajorVisibility() {
  const isBSIT = courseSelect.value === "BSIT";
  majorField.hidden = !isBSIT;
  if (!isBSIT) {
    majorSelect.value = "";
    clearError("major");
  }
}

/* Build the full name from the optional and required parts */
function buildFullName(data) {
  return [data.prefix, data.firstName, data.middleName, data.lastName, data.suffix]
    .filter(Boolean)
    .join(" ");
}

function addRecord(data) {
  const emptyRow = recordsBody.querySelector(".empty-row");
  if (emptyRow) emptyRow.remove();

  enrollmentCount += 1;

  const course = data.major ? `${data.course} - ${data.major}` : data.course;
  const cells = [
    ["#", enrollmentCount],
    ["Student ID", data.studentId],
    ["Name", buildFullName(data)],
    ["Email", data.email],
    ["Course", course],
    ["Year level", data.yearLevel]
  ];

  const row = document.createElement("tr");
  cells.forEach(([label, text]) => {
    const td = document.createElement("td");
    td.dataset.label = label;
    td.textContent = text; // textContent avoids injecting HTML
    row.appendChild(td);
  });
  recordsBody.appendChild(row);
}

/* Clear a field's error as soon as the user edits it */
Object.keys(rules).forEach((name) => {
  const field = form.elements[name];
  const eventName = field.tagName === "SELECT" ? "change" : "input";
  field.addEventListener(eventName, () => {
    clearError(name);
    hideStatus();
  });
});

courseSelect.addEventListener("change", updateMajorVisibility);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  hideStatus();

  let firstInvalid = null;

  Object.keys(rules).forEach((name) => {
    const message = validateField(name);
    if (message) {
      showError(name, message);
      if (!firstInvalid) firstInvalid = form.elements[name];
    } else {
      clearError(name);
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const data = {};
  Object.keys(rules).forEach((name) => {
    data[name] = form.elements[name].value.trim();
  });

  addRecord(data);

  statusBox.textContent = `${buildFullName(data)} was enrolled successfully.`;
  statusBox.hidden = false;

  form.reset();
  updateMajorVisibility();
});