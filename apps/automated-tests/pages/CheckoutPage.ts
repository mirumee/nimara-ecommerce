import { expect, type Page } from "@playwright/test";
import { paymentDetails, type Product, URLS, user } from "utils/constants";
import { formatAsPrice } from "utils/formatter";

type CheckoutType = "guest" | "registered";

export class CheckoutPage {
  readonly checkoutType: CheckoutType;
  readonly page: Page;
  readonly product: Product;

  constructor(opts: {
    checkoutType: CheckoutType;
    page: Page;
    product: Product;
  }) {
    this.page = opts.page;
    this.product = opts.product;
    this.checkoutType = opts.checkoutType;
  }

  async provideUserDetails() {
    await this.page.getByLabel("Email").fill(user.email);

    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_SHIPPING_ADDRESS);

    await expect(this.page).toHaveURL(
      `${process.env.TEST_ENV_URL}/${URLS().CHECKOUT_PAGE_SHIPPING_ADDRESS}`,
    );
  }

  async checkUserDetails() {
    await expect(this.page.getByText("Signed in as")).toBeVisible();
    await expect(
      this.page.getByText("John Doe, Nimara_Automation_Test@mx.mirumee.rocks"),
    ).toBeVisible();
  }

  async checkPageSections() {
    if (this.checkoutType === "guest") {
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

  async provideShippingAddress() {
    await this.page.getByLabel("First Name").fill(user.name);
    await this.page.getByLabel("Last Name").fill(user.lastName);
    await this.page.getByLabel("Company Name").fill(user.companyName);
    await this.page.getByLabel("Phone").fill(user.phone);
    await this.page
      .getByLabel("Street address")
      .first()
      .fill(user.streetAddress);
    await this.page.getByLabel("Postal").fill(user.postCode);
    await this.page.getByLabel("Post town").fill(user.city);

    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_DELIVERY_METHOD);

    await expect(this.page).toHaveURL(
      `${process.env.TEST_ENV_URL}/${URLS().CHECKOUT_PAGE_DELIVERY_METHOD}`,
    );
  }

  async useSavedShippingAddress() {
    await expect(this.page.getByText("Saved addresses")).toBeVisible();
    await expect(this.page.getByTestId("shippingAddressId_0")).toBeChecked();

    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_DELIVERY_METHOD);

    await expect(this.page).toHaveURL(
      `${process.env.TEST_ENV_URL}/${URLS().CHECKOUT_PAGE_DELIVERY_METHOD}`,
    );
  }

  async selectDeliveryOption() {
    await this.page.getByText(this.product.deliveryMethod.name).check();

    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.page.waitForURL(URLS().CHECKOUT_PAGE_PAYMENT);

    await expect(this.page).toHaveURL(
      `${process.env.TEST_ENV_URL}/${URLS().CHECKOUT_PAGE_PAYMENT}`,
    );
  }

  async checkOrderSummary() {
    const productPrice = this.page.getByTestId(
      "shopping-bag-product-line-price",
    );
    const subtotal = this.page.getByTestId("shopping-bag-price-subtotal");
    const deliveryPrice = this.page.getByTestId(
      "shopping-bag-price-delivery-method",
    );
    const total = this.page.getByTestId("shopping-bag-price-total");

    await expect(
      this.page.getByText(`qty: ${this.product.quantity}`),
    ).toBeVisible();
    await expect(
      productPrice.getByText(
        formatAsPrice({
          amount: this.product.price.amount,
          currency: this.product.price.currency,
        }),
      ),
    ).toBeVisible();
    await expect(
      subtotal.getByText(
        formatAsPrice({
          amount: this.product.price.amount,
          currency: this.product.price.currency,
        }),
      ),
    ).toBeVisible();
    await expect(
      deliveryPrice.getByText(
        formatAsPrice({
          amount: this.product.deliveryMethod.amount,
          currency: this.product.deliveryMethod.currency,
        }),
      ),
    ).toBeVisible();
    await expect(
      total.getByText(
        formatAsPrice({
          amount:
            this.product.price.amount + this.product.deliveryMethod.amount,
          currency: this.product.price.currency,
        }),
      ),
    ).toBeVisible();
  }

  async payAndConfirmOrderAsGuest() {
    const stripePaymentElement = this.page.frameLocator(
      "[title='Secure payment input frame']",
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

    await expect(this.page.getByText("Billing address")).toBeVisible();

    await expect(
      this.page.getByRole("checkbox", { name: "Same as shipping address" }),
    ).toBeChecked();

    const placeOrderButton = this.page.getByRole("button", {
      name: "Place order",
    });

    await expect(placeOrderButton).toBeEnabled();

    await placeOrderButton.click();
    await this.page.waitForURL(URLS().ORDER_CONFIRMATION_PAGE);

    await expect(
      this.page.getByText("Your order has been successfully placed"),
    ).toBeVisible();
  }

  async payAndConfirmOrderAsUser() {
    const newPaymentMethodTab = this.page.getByText("New method");
    const stripePaymentElement = this.page.frameLocator(
      "[title='Secure payment input frame']",
    );

    if (newPaymentMethodTab) {
      await newPaymentMethodTab.click();
      await expect(
        stripePaymentElement.getByRole("button", { name: "Card" }),
      ).toBeVisible();
    }

    await stripePaymentElement
      .getByText("Card number")
      .fill(paymentDetails.cardNumber);
    await stripePaymentElement
      .getByText("Expiry date")
      .fill(paymentDetails.expiryDate);
    await stripePaymentElement
      .getByText("Security code")
      .fill(paymentDetails.cvc);

    await expect(this.page.getByText("Billing address")).toBeVisible();

    await expect(
      this.page.getByRole("checkbox", { name: "Same as shipping address" }),
    ).not.toBeChecked();

    await expect(this.page.getByTestId("billingAddress_0")).toBeChecked();

    const placeOrderButton = this.page.getByRole("button", {
      name: "Place order",
    });

    await expect(placeOrderButton).toBeEnabled();

    await placeOrderButton.click();
    await this.page.waitForURL(URLS().ORDER_CONFIRMATION_PAGE);

    await expect(
      this.page.getByText("Your order has been successfully placed"),
    ).toBeVisible();
  }
}
