// employeeManagement.js
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Array to store employees
let employees = [];

// Function to display the menu
function showMenu() {
  console.log("\n=== Employee Management System ===");
  console.log("1. Add Employee");
  console.log("2. View Employees");
  console.log("3. Update Employee");
  console.log("4. Delete Employee");
  console.log("5. Exit");
  rl.question("Enter your choice: ", handleMenu);
}

// Handle menu choices
function handleMenu(choice) {
  switch (choice.trim()) {
    case "1":
      addEmployee();
      break;
    case "2":
      viewEmployees();
      break;
    case "3":
      updateEmployee();
      break;
    case "4":
      deleteEmployee();
      break;
    case "5":
      console.log("Exiting...");
      rl.close();
      break;
    default:
      console.log("Invalid choice, try again.");
      showMenu();
  }
}

// Add employee
function addEmployee() {
  rl.question("Enter Employee Name: ", (name) => {
    rl.question("Enter Employee Role: ", (role) => {
      const id = employees.length + 1;
      employees.push({ id, name, role });
      console.log("Employee added successfully!");
      showMenu();
    });
  });
}

// View all employees
function viewEmployees() {
  console.log("\n--- Employee List ---");
  if (employees.length === 0) {
    console.log("No employees found.");
  } else {
    employees.forEach((emp) => {
      console.log(`ID: ${emp.id}, Name: ${emp.name}, Role: ${emp.role}`);
    });
  }
  showMenu();
}

// Update employee
function updateEmployee() {
  rl.question("Enter Employee ID to update: ", (id) => {
    const emp = employees.find((e) => e.id === parseInt(id));
    if (!emp) {
      console.log("Employee not found.");
      return showMenu();
    }
    rl.question("Enter new Name (leave blank to keep current): ", (name) => {
      rl.question("Enter new Role (leave blank to keep current): ", (role) => {
        if (name.trim()) emp.name = name;
        if (role.trim()) emp.role = role;
        console.log("Employee updated successfully!");
        showMenu();
      });
    });
  });
}

// Delete employee
function deleteEmployee() {
  rl.question("Enter Employee ID to delete: ", (id) => {
    const index = employees.findIndex((e) => e.id === parseInt(id));
    if (index === -1) {
      console.log("Employee not found.");
    } else {
      employees.splice(index, 1);
      console.log("Employee deleted successfully!");
    }
    showMenu();
  });
}

// Start the program
showMenu();
