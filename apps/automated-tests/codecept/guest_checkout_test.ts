import { storeHeaders,timeoutSeconds } from "./data/constants";

type GuestCheckoutSupport = Pick<
  CodeceptJS.SupportObject,
  "I" | "homepagePage" | "productPage" | "cartPage" | "checkoutPage"
>;

function addClothingToCart({
  homepagePage,
  productPage,
}: GuestCheckoutSupport) {
  homepagePage.enterPage();
  homepagePage.acceptCookies();
  homepagePage.clickOnProduct1(timeoutSeconds);
  productPage.addExampleClothingToCart(timeoutSeconds);
}

function addMusicRecordAsSecondItem({
  homepagePage,
  productPage,
}: GuestCheckoutSupport) {
  homepagePage.clickOnProduct2(timeoutSeconds);
  productPage.addMusicRecordToCart(timeoutSeconds);
}

async function completeGuestCheckout(
  { cartPage, checkoutPage }: GuestCheckoutSupport,
  cardCharacteristics: "valid" | "stolen" | "expired",
) {
  cartPage.goToCheckoutFromBag(timeoutSeconds);
  checkoutPage.continueAsGuest(timeoutSeconds);
  checkoutPage.enterGuestEmail(timeoutSeconds);
  await checkoutPage.confirmContinueAsGuestIfPrompted();
  checkoutPage.fillShippingAddress(timeoutSeconds);
  checkoutPage.selectDhlNormalShippingMethod(timeoutSeconds);
  checkoutPage.fillPaymentDetails(cardCharacteristics, timeoutSeconds);
  checkoutPage.clickPlaceOrder(timeoutSeconds);
}

Feature("Guest Checkout - positive");

Scenario(
  "Full process from entry to checkout and payment (proceed to the cart through the 'item added to cart' popup)",
  async ({ I, homepagePage, productPage, cartPage, checkoutPage }) => {
    const support = { I, homepagePage, productPage, cartPage, checkoutPage };

    addClothingToCart(support);
    productPage.clickGoToBagPopup(timeoutSeconds);
    await completeGuestCheckout(support, "valid");
    I.waitForText(storeHeaders.orderSuccess, timeoutSeconds);
  },
);

Scenario(
  "Full process from entry to checkout and payment (proceed to the cart through the menu button)",
  async ({ I, homepagePage, productPage, cartPage, checkoutPage }) => {
    const support = { I, homepagePage, productPage, cartPage, checkoutPage };

    addClothingToCart(support);
    productPage.goToBag(timeoutSeconds);
    await completeGuestCheckout(support, "valid");
    I.waitForText(storeHeaders.orderSuccess, timeoutSeconds);
  },
);

Scenario(
  "Full process from entry to checkout and payment  - 2 items (proceed to the cart through the menu button)",
  async ({ I, homepagePage, productPage, cartPage, checkoutPage }) => {
    const support = { I, homepagePage, productPage, cartPage, checkoutPage };

    addClothingToCart(support);
    addMusicRecordAsSecondItem(support);
    productPage.goToBag(timeoutSeconds);
    await completeGuestCheckout(support, "valid");
    I.waitForText(storeHeaders.orderSuccess, timeoutSeconds);
  },
);

Feature("Guest Checkout - negative");

Scenario(
  "Full process from entry to checkout and payment (proceed to the cart through the menu button) - fraudulent/stolen card",
  async ({ I, homepagePage, productPage, cartPage, checkoutPage }) => {
    const support = { I, homepagePage, productPage, cartPage, checkoutPage };

    addClothingToCart(support);
    productPage.goToBag(timeoutSeconds);
    await completeGuestCheckout(support, "stolen");
    I.waitForText(storeHeaders.cardDeclined, timeoutSeconds);
  },
);

Scenario(
  "Full process from entry to checkout and payment (proceed to the cart through the menu button) - expired card",
  async ({ I, homepagePage, productPage, cartPage, checkoutPage }) => {
    const support = { I, homepagePage, productPage, cartPage, checkoutPage };

    addClothingToCart(support);
    productPage.goToBag(timeoutSeconds);
    await completeGuestCheckout(support, "expired");
    I.waitForText(storeHeaders.cardDeclined, timeoutSeconds);
  },
);
