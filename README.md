#OPENCLASSROOMS PROJECT 9
Debug and test an HR SaaS

//BRIEF//

The objective of my mission concerns the implementation of tests on the "expense reports" functionality.
The functionality has two user journeys: the employee and the HR administrator.

The back-end of the two routes is ready in alpha version.
On the front-end, for the HR administrator course, it is complete, fully tested and debugged.
It only remained to do the same for the front-end of the employee journey.

So I proceeded in two steps:

1. fix the bugs identified by Jest and by Leila on the employee journey.
2. Write the various unit and integration tests for the Bills and NewBill files while ensuring good branch coverage outside of back-end calls to firebase
3. Finish with the drafting of an E2E plan in order to guide Leila in the test of the employee journey in a manual way

//Soutenace 9 'Walid'//

##For Developers

---

**How to launch the application locally** :

Clone the project :
```
$ git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR.git
```

Go to repo :
```
$ cd Billed-app-FR
```

Install npm packages (décrits dans `package.json`) :
```
$ npm install
```

Install live-server :
```
$ npm install -g live-server
```

Launch application :
```
$ live-server
```

Go to : `http://127.0.0.1:8080/`


**How to run all tests locally with Jest :**

```
$ npm run test
```

**How to run a single test :**

Installez jest-cli :

```
$npm i -g jest-cli
$jest src/__tests__/your_test_file.js
```

**How to view test coverage :**

`http://127.0.0.1:8080/coverage/lcov-report/`


@rardooba

