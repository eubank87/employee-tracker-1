const inquirer = require("inquirer");
const mysql = require("mysql");
const table = require("console.table");

// arrays of entered info
const allDepartments = [];
const allRoles = [];
const allEmployees = [];

const Employee = require("./classes/employee");
const Role = require("./classes/role");
const Department = require("./classes/department");



// make the connections
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "employees_db"
});


// what to do with connection
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    console.log("successful connection");
    start();

});

function start() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["Add Employee", "Delete Employee", "Add Role", "Add Department", "View All Departments", "View all Roles", "View All Employees", "Quit"],
            name: "startChoice"
        }
    ])

        // Initial List of Options
        .then((answer) => {
            switch (answer.startChoice) {
                case "Quit":
                    console.log("Thanks for using my program!");
                    connection.end();
                    break;

                case "Add Employee":
                    addEmployee();
                    break;

                case "Add Role":
                    addRole();
                    break;

                case "Add Department":
                    addDepartment();
                    break;

                case "View All Departments":
                    viewDepts();
                    break;

                default:
                    console.log("Please enter a valid answer")
                    start();
                    break;
            }
        })
}


function endChoice() {

    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do now?",
            choices: ["Back to Start", "Quit"],
            name: "endChoice"
        }
    ])
        .then((answer) => {
            if (answer.endChoice === "Back to Start") {
                start();
            } else {
                connection.end();
            }
        })


}


// TODO: add employee (connect to role_Id, manager_id)
function addEmployee() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter Employee First Name: ",
            name: "first_name"
        },
        {
            type: "input",
            message: "Enter Employee Last Name: ",
            name: "last_name"
        },
        {
            type: "number",
            message: "Enter Employee Role ID: ",
            name: "role_id"
        },
        {
            type: "input",
            message: "Enter Employee Manager ID (Leave blank if none): ",
            name: "manager_id"
        }
    ])
        .then((answers) => {

            // check if manager id entered
            if (answers.manager_id) {
                // insert info w/ manager id if present
                connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [answers.first_name, answers.last_name, answers.role_id, answers.manager_id], (res, err) => {
                    if (err) throw err;
                    




                    endChoice();
                })
            } else {
                // insert info w/o manager id if not present
                connection.query("INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)", [answers.first_name, answers.last_name, answers.role_id], (res, err) => {
                    if (err) throw err;
                    endChoice();
                })
            }

            // TODO: then create new employee class object

        })
}




// add department with auto dept. number at each entry
function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter Department Name:",
            name: "deptName"
        }
    ])
        .then((answers) => {
            connection.query("INSERT INTO department (name) VALUES (?)", [answers.deptName], (err, res) => {
                if (err) throw err;
                console.log(`New Department "${answers.deptName}" created with ID # ${res.insertId}`);

                // create new department class object
                // let newDept = new Department(res.insertId, answers.deptName);

                // push new dept object to storage array
                allDepartments.push(newDept);
                
                endChoice();
            })
        })

        
}




// TODO: add new role connect to department number
function addRole() {
    // get all dept names into array of key/value pairs
    const deptArr = [];

    connection.query("SELECT id, name FROM department;", (err, res) => {
        if (err) throw err;

        for (i in res){
            newObj = {};
            newObj.id = res[i].id;
            newObj.name = res[i].name;
            deptArr.push(newObj);
        }

    inquirer.prompt([
        {
            type: "list",
            message: "Enter Department for new role: ",
            choices: deptArr, // array of department names
            name: "deptName"
        },
        {
            type: "input",
            message: "Enter Role Title:",
            name: "roleName"
        },
        {
            type: "number",
            message: "Enter Salary for new role:",
            name: "salary"
        }
     
    ])
        .then((answers) => {

            // capture department ID of user choice for use in SQL query
            let dept_id;
            console.log(deptArr[2].name);
            console.log(answers.deptName);
            for (i in deptArr){
                if (deptArr[i].name === answers.deptName){
                    
                    dept_id = deptArr[i].id;
                    console.log(dept_id);
                    endChoice();

                } 
            }

            // add info to SQL database 
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [answers.roleName, answers.salary, dept_id], (err, res) => {
                if (err) throw err;
                console.log(res);
                console.log("Role Added");

                endChoice();
                

            })   
        })     
    })
}

function viewDepts() {
    connection.query("SELECT * FROM department", (res, err) => {
        if (err) throw err;
        console.log(res);
        endChoice();
    });
}