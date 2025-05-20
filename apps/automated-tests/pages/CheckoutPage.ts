import { expect, type Locator, type Page } from "@playwright/test";
import {
  type PaymentDetails,
  type Product,
  URLS,
  type User,
} from "utils/constants";
import { formatAsPrice } from "utils/formatter";

type CheckoutType = "guest" | "registered";
type PaymentMethodType = "savedMethod" | "newMethod" | "guestPayment";
type BillingAddressType = "sameAsShipping" | "newAddress" | "savedAddress";

export class CheckoutPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyNameInput: Locator;
  readonly phoneInput: Locator;
  readonly streetAddressInput: Locator;
  readonly postalInput: Locator;
  readonly postTownInput: Locator;
  readonly savedMethodButton: Locator;
  readonly newMethodButton: Locator;
  readonly savedAddressesButton: Locator;
  readonly newAddressesButton: Locator;
  readonly productPriceText: Locator;
  readonly subtotalText: Locator;
  readonly totalText: Locator;
  readonly deliveryPriceText: Locator;
  readonly billingAddressSameAsShippingCheckbox: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.continueButton = page.getByRole("button", { name: "Continue" });
    this.firstNameInput = page.getByLabel("First Name");
    this.lastNameInput = page.getByLabel("Last Name");
    this.companyNameInput = page.getByLabel("Company Name");
    this.phoneInput = page.getByLabel("Phone");
    this.streetAddressInput = page.getByLabel("Street address", {
      exact: true,
    });
    this.postalInput = page.getByLabel("Postal");
    this.postTownInput = page.getByLabel("Post town");
    this.savedMethodButton = page.getByRole("tab", { name: "Saved methods" });
    this.newMethodButton = page.getByRole("tab", { name: "New method" });
    this.savedAddressesButton = page.getByRole("tab", {
      name: "Saved addresses",
    });
    this.newAddressesButton = page.getByRole("tab", { name: "New address" });
    this.productPriceText = this.page.getByTestId(
      "shopping-bag-product-line-price",
    );
    this.subtotalText = this.page.getByTestId("shopping-bag-price-subtotal");
    this.totalText = this.page.getByTestId("shopping-bag-price-total");
    this.deliveryPriceText = this.page.getByTestId(
      "shopping-bag-price-delivery-method",
    );
    this.billingAddressSameAsShippingCheckbox = this.page.getByRole(
      "checkbox",
      { name: "Same as shipping address" },
    );
    this.placeOrderButton = this.page.getByRole("button", {
      name: "Place order",
    });
  }

  async provideUserDetails(email: string) {
    await this.emailInput.fill(email);

    await this.continueButton.click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_SHIPPING_ADDRESS);

    await expect(this.page).toHaveURL(
      `${process.env.TEST_ENV_URL}/${URLS().CHECKOUT_PAGE_SHIPPING_ADDRESS}`,
    );
  }

  async assertUserDetails(user: User, userEmail: string) {
    await expect(
      this.page.getByText(`${user.name} ${user.lastName}, ${userEmail}`),
    ).toBeVisible();
  }

  async assertPageSections(checkoutType: CheckoutType) {
    if (checkoutType === "guest") {
      await expect(
        this.page.getByRole("heading", { name: "Email" }),
      ).toBeVisible();
    } else {
      await expect(this.page.getByText("Signed in as")).toBeVisible();
    }

    await expect(
      this.page.getByRole("heading", { name: "Shipping address" }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: "Delivery" }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: "Payment" }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: "Your bag" }),
    ).toBeVisible();
  }

  async provideShippingAddress(user: User) {
    await this.firstNameInput.fill(user.name);
    await this.lastNameInput.fill(user.lastName);
    await this.companyNameInput.fill(user.companyName);
    await this.phoneInput.fill(user.phone);
    await this.streetAddressInput.fill(user.streetAddress);
    await this.postalInput.fill(user.postCode);
    await this.postTownInput.fill(user.city);

    await this.continueButton.click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_DELIVERY_METHOD);

    await expect(this.page).toHaveURL(
      `${process.env.TEST_ENV_URL}/${URLS().CHECKOUT_PAGE_DELIVERY_METHOD}`,
    );
  }

  async useSavedShippingAddress() {
    await expect(this.savedAddressesButton).toBeVisible();
    await expect(this.page.getByTestId("shippingAddressId_0")).toBeChecked();

    await this.continueButton.click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_DELIVERY_METHOD);

    await expect(this.page).toHaveURL(
      `${process.env.TEST_ENV_URL}/${URLS().CHECKOUT_PAGE_DELIVERY_METHOD}`,
    );
  }

  async useNewShippingAddress(user: User) {
    await this.newAddressesButton.click();
    await this.provideShippingAddress(user);
  }

  async selectDeliveryOption(deliveryMethod: string) {
    await this.page.getByText(deliveryMethod).click();

    await this.continueButton.click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_PAYMENT);

    await expect(this.page).toHaveURL(
      `${process.env.TEST_ENV_URL}/${URLS().CHECKOUT_PAGE_PAYMENT}`,
    );
  }

  async assertOrderSummary(product: Product) {
    await expect(this.page.getByText(`qty: ${product.quantity}`)).toBeVisible();
    await expect(
      this.productPriceText.getByText(
        formatAsPrice({
          amount: product.price.amount,
          currency: product.price.currency,
        }),
      ),
    ).toBeVisible();
    await expect(
      this.subtotalText.getByText(
        formatAsPrice({
          amount: product.price.amount,
          currency: product.price.currency,
        }),
      ),
    ).toBeVisible();
    await expect(
      this.deliveryPriceText.getByText(
        formatAsPrice({
          amount: product.deliveryMethod.amount,
          currency: product.deliveryMethod.currency,
        }),
      ),
    ).toBeVisible();
    await expect(
      this.totalText.getByText(
        formatAsPrice({
          amount: product.price.amount + product.deliveryMethod.amount,
          currency: product.price.currency,
        }),
      ),
    ).toBeVisible();
  }

  async providePaymentMethod(
    paymentMethod: PaymentMethodType,
    paymentDetails?: PaymentDetails,
  ) {
    if (paymentMethod === "savedMethod") {
      await this.savedMethodButton.click();
    } else if (paymentMethod === "newMethod") {
      if (!paymentDetails) {
        throw new Error("Payment details are required for new payment method");
      }
      await this.newMethodButton.click();
      await this.fillPaymentByCardForm(paymentDetails);
    } else if (paymentMethod === "guestPayment") {
      if (!paymentDetails) {
        throw new Error("Payment details are required for guest payment");
      }
      await this.fillPaymentByCardForm(paymentDetails);
    }
  }

  async fillPaymentByCardForm(paymentDetails: PaymentDetails) {
    const iframeName = "Secure payment input frame";

    const stripeIframe = this.page.locator(`iframe[title='${iframeName}']`);

    await stripeIframe.waitFor({ state: "visible" });

    await this.page.frame(iframeName)?.waitForLoadState("load");

    const stripePaymentElement = this.page.frameLocator(
      `[title='${iframeName}']`,
    );

    await stripePaymentElement
      .getByText("Card number")
      .fill(paymentDetails.cardNumber);
    await stripePaymentElement
      .getByText("Expiry date")
      .fill(paymentDetails.expiryDate);
    await stripePaymentElement
      .getByText("Security code")
      .fill(paymentDetails.cvc);
  }

  async useSavedBillingAddress() {
    await expect(this.savedAddressesButton).toBeVisible();
    await expect(this.page.getByTestId("billingAddress_0")).toBeChecked();
  }

  async provideBillingAddress(billingAddressType: BillingAddressType) {
    await this.billingAddressSameAsShippingCheckbox.scrollIntoViewIfNeeded();
    await expect(this.billingAddressSameAsShippingCheckbox).toBeInViewport();

    if (billingAddressType === "sameAsShipping") {
      await this.billingAddressSameAsShippingCheckbox.check();
      await expect(this.billingAddressSameAsShippingCheckbox).toBeChecked();
    } else if (billingAddressType === "newAddress") {
      await this.newAddressesButton.click();
    } else if (billingAddressType === "savedAddress") {
      await this.useSavedBillingAddress();
    }
  }

  async placeOrder() {
    await this.placeOrderButton.scrollIntoViewIfNeeded();
    await expect(this.placeOrderButton).toBeInViewport();
    await expect(this.placeOrderButton).toBeEnabled();

    await this.placeOrderButton.click();
    await this.page.waitForURL(URLS().ORDER_CONFIRMATION_PAGE);

    await expect(
      this.page.getByText("Your order has been successfully placed"),
    ).toBeVisible();
  }
}
