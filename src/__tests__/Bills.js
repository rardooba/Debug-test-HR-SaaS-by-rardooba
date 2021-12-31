import { screen, fireEvent } from "@testing-library/dom";

import { ROUTES, ROUTES_PATH } from "../constants/routes";

import { bills } from "../fixtures/bills.js";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";

import Router from "../app/Router";

import Firestore from "../app/Firestore";

import { localStorageMock } from "../__mocks__/localStorage.js";
import firebase from "../__mocks__/firebase";

//*---------------------------------------------------------------------*//

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    //! Bill icon highlighted
    test("Then bill icon in vertical layout should be highlighted", () => {
      //stockage de datas
      jest.mock("../app/Firestore");
      //jest.fn() simule une fonction non utilisée > mockResolvedValue() return promise => utile pour simuler les fonctions asynchrones
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });
      //On recup les elt mockés
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      //on simule le status d'employée via les datas du localStorage
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const pathname = ROUTES_PATH["Bills"];
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      //on affiche les elt de page verticalLayout + BillsList
      document.body.innerHTML = `<div id="root"></div>`;
      Router();
      //on verifie que la class .active-icon est bien présente pour l'icone
      expect(
        screen.getByTestId("icon-window").classList.contains("active-icon")
      ).toBe(true);
    });

    //! chronological order of Bills
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    //! Loader situation
    describe("when the Bills Page is loading", () => {
      test("Then, Loading page should be rendered", () => {
        //on charge la page BillsUI
        document.body.innerHTML = BillsUI({ loading: true });
        //On vérifie via le txt si la page est en chargement LoadingPage()
        expect(screen.getAllByText("Loading...")).toBeTruthy();
      });
    });
    describe("when the Bills Page loading return an error", () => {
      test("Then, Error page should be rendered", () => {
        document.body.innerHTML = BillsUI({ error: "oops an error" });
        expect(screen.getAllByText("Erreur")).toBeTruthy();
      });
    });
  });
});

//! BTN "Envoyer une note de frais"
describe("Given I am connected as Employee and I am on Bills page", () => {
  describe("When I click on the New Bill button", () => {
    test("Then, it should render NewBill page", () => {
      //recup d'info de status Employee => appli en mode Employee
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      //on affiche la page BillsUI
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const firestore = null;
      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      //traitement de l'event du click
      const handleClickNewBill = jest.fn(allBills.handleClickNewBill);
      const billBtn = screen.getByTestId("btn-new-bill");
      billBtn.addEventListener("click", handleClickNewBill);
      fireEvent.click(billBtn);

      //on vérifie la présence (rendu) du btn "Envoyer une note de frais"
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  //! Traitement de la modal si ouverte
  describe("When I click on the eye icon", () => {
    test("then, it should open a modal", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const firestore = null;
      const allBills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn();
      //recup des icones
      const eye = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn((e) =>
        allBills.handleClickIconEye(eye)
      );

      //écoute de l'event click
      eye.addEventListener("click", handleClickIconEye);
      fireEvent.click(eye);

      //vérif que la modal est appelée puis lancée
      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = document.getElementById("modaleFile");
      expect(modale).toBeTruthy();
    });
  });
});

//! test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills UI", () => {
    //Récup des données mockées pour GET
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get");
      const bills = await firebase.get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    });

    //! vérif de l'affichage de la bonne page d'erreur
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
