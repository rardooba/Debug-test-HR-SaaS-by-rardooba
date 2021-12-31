import { screen, fireEvent } from "@testing-library/dom";

import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";

import { ROUTES } from "../constants/routes";

import NewBill from "../containers/NewBill.js";

import firebase from "../__mocks__/firebase";
import { localStorageMock } from "../__mocks__/localStorage.js";

//*__mock__
jest.mock("../app/Firestore");

//! Rendu de la page NewBill (form)
describe("Given I am connected as an employee", () => {
  describe("When I access NewBill Page", () => {

    //! vérif du rendu via le titre de la page NewBill
    test("Then the newBill page should be rendered", () => {
      //affichage de la page
      document.body.innerHTML = NewBillUI();
      //vérif
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });

    //! vérif que le formulaire comporte 9 champs
    test("Then a form with nine fields should be rendered", () => {
      document.body.innerHTML = NewBillUI();
      //recup du bloc formulaire pour en tester la longueur (si = 9)
      const form = document.querySelector("form");
      expect(form.length).toEqual(9);
    });
  });

  //! Traitement de l'ajout de justificatif
  describe("When I am on NewBill Page and I add an image file", () => {
    test("Then this new file should have been changed in the input file", () => {

      //Recup du status de connexion
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      //Affichage de la page
      const html = NewBillUI();
      document.body.innerHTML = html;

      //recup des datas
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      //recup du bloc d'ajout de justificatif
      const inputFile = screen.getByTestId("file");

      //on écoute l'event lors de l'ajout du fichier
      inputFile.addEventListener("change", handleChangeFile);

      //init du fichier ajouté en simulant l'interaction (un changement de fichier)
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["image.png"], "image.png", { type: "image/png" })],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      //on vérif le bon changement de l'input
      expect(inputFile.files[0].name).toBe("image.png");
    });
  });

  //! Vérif qu'une note est bien crée
  describe("When I am on NewBill Page and I submit the form width an image (jpg, jpeg, png)", () => {
    test("Then it should create a new bill", () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const firestore = null;
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const submitBtn = screen.getByTestId("form-new-bill");
      submitBtn.addEventListener("submit", handleSubmit);
      //on simule l'envoie du form
      fireEvent.submit(submitBtn);
      //on vérif que la f(x) qui crée la nouvelle note est bien appelée 
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  //! Si mauvais format d'image
  describe("When I am on NewBill Page and I add a file other than an image (jpg, jpeg or png)", () => {
    test("Then, the bill shouldn't be created and I stay on the NewBill page", () => {

      //recup d'info de status Employee
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const firestore = null;
      //on affiche la page BillsUI
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      newBill.fileName = "invalid";
      const submitBtn = screen.getByTestId("form-new-bill");
      submitBtn.addEventListener("submit", handleSubmit);
      //simulation de l'envoie
      fireEvent.submit(submitBtn);
      expect(handleSubmit).toHaveBeenCalled();
      //vérif que nous sommes toujours sur la même page
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
});


//! test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    test("Add bill to mock API POST", async () => {

      //on espionne l'objet firebase => crée une f(x) simulée + surveille les appels à objet => return une f(x) simulée de jest > jest.spyOn(object, methodName)
      const getSpyPost = jest.spyOn(firebase, "post");

      //ajout de data mock
      const newBill = {
        id: "eoKIpYhECmaZAGRrHjaC",
        status: "refused",
        pct: 10,
        amount: 500,
        email: "rar@rar.com",
        name: "Facture 001",
        vat: "60",
        fileName: "preview-facture-pdf.jpg",
        date: "2021-12-18",
        commentAdmin: "à valider",
        commentary: "A déduire",
        type: "Restaurants et bars",
        fileUrl: "https://unsplash.com/photos/gnyA8vd3Otc",
      };

      //en asynchrone on attend la data de la methode post
      const bills = await firebase.post(newBill);
      //on vérif le nombre de requete d'Api
      expect(getSpyPost).toHaveBeenCalledTimes(1);
      //on vérif le nombre de data qui doit être de 5
      expect(bills.data.length).toBe(1);
    });

    //! vérif de l'affichage de la bonne page d'erreur
    test("Add bill to API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("Add bill to API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
