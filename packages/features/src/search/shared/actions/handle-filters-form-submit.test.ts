import { getLocale } from "next-intl/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { redirect } from "@nimara/i18n/routing";

import * as actions from "./handle-filters-form-submit";

vi.mock("next-intl/server");
vi.mock("@nimara/i18n/routing");

const DEFAULT_SORT_BY = "price-asc";

describe("PLP - Filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should clear values on clear submit", async () => {
    const currentLocale = "en-US";

    vi.mocked(getLocale).mockResolvedValue(currentLocale);
    vi.mock("@nimara/i18n/routing", () => ({
      redirect: vi.fn(),
    }));

    const formData = new FormData();

    formData.append("clear", "true");
    formData.append("color", "red");

    const searchParams = { sortBy: "name-asc" };

    await actions.handleFiltersFormSubmit(
      searchParams,
      DEFAULT_SORT_BY,
      formData,
      "/search",
      redirect,
    );

    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith({
      href: "/search?sortBy=name-asc",
      locale: currentLocale,
    });
  });

  it("should update the URL on submit", async () => {
    const currentLocale = "en-US";

    vi.mocked(getLocale).mockResolvedValue(currentLocale);
    vi.mock("@nimara/i18n/routing", () => ({
      redirect: vi.fn(),
    }));

    const formData = new FormData();

    formData.append("color", "green");

    const searchParams = { sortBy: "name-asc" };

    await actions.handleFiltersFormSubmit(
      searchParams,
      DEFAULT_SORT_BY,
      formData,
      "/search",
      redirect,
    );

    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith({
      href: "/search?sortBy=name-asc&color=green",
      locale: currentLocale,
    });
  });

  it("should not remove existing search params when no new filters are submitted", async () => {
    const currentLocale = "en-GB";

    vi.mocked(getLocale).mockResolvedValue(currentLocale);
    vi.mock("@nimara/i18n/routing", () => ({
      redirect: vi.fn(),
    }));

    const formData = new FormData();
    const searchParams = { sortBy: "price-desc", page: "2" };

    await actions.handleFiltersFormSubmit(
      searchParams,
      DEFAULT_SORT_BY,
      formData,
      "/search",
      redirect,
    );

    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith({
      href: "/search?sortBy=price-desc&page=2",
      locale: currentLocale,
    });
  });

  it("should replace boolean filters correctly", async () => {
    const currentLocale = "en-GB";

    vi.mocked(getLocale).mockResolvedValue(currentLocale);
    vi.mock("@nimara/i18n/routing", () => ({
      redirect: vi.fn(),
    }));

    const formData = new FormData();

    formData.append("is-exclusive", "true");
    formData.append("is-digital", "");
    formData.append("sortBy", "price-desc");

    const searchParams = { sortBy: "price-asc", "is-digital": "true" };

    await actions.handleFiltersFormSubmit(
      searchParams,
      DEFAULT_SORT_BY,
      formData,
      "/search",
      redirect,
    );

    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith({
      href: "/search?sortBy=price-desc&is-exclusive=true",
      locale: currentLocale,
    });
  });
});
