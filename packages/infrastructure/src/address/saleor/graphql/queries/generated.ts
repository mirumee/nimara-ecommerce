import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AddressValidationRulesQuery_addressValidationRules_AddressValidationData_countryAreaChoices_ChoiceValue = { raw: string | null, verbose: string | null };

export type AddressValidationRulesQuery_addressValidationRules_AddressValidationData = { addressFormat: string, allowedFields: Array<string>, requiredFields: Array<string>, countryAreaType: string, postalCodeType: string, cityType: string, postalCodeExamples: Array<string>, postalCodeMatchers: Array<string>, countryAreaChoices: Array<AddressValidationRulesQuery_addressValidationRules_AddressValidationData_countryAreaChoices_ChoiceValue> };

export type AddressValidationRulesQuery_Query = { addressValidationRules: AddressValidationRulesQuery_addressValidationRules_AddressValidationData | null };


export type AddressValidationRulesQueryVariables = Types.Exact<{
  countryCode: Types.CountryCode;
}>;


export type AddressValidationRulesQuery = AddressValidationRulesQuery_Query;

export type ChannelQuery_channel_Channel_countries_CountryDisplay = { code: string, country: string };

export type ChannelQuery_channel_Channel = { countries: Array<ChannelQuery_channel_Channel_countries_CountryDisplay> | null };

export type ChannelQuery_Query = { channel: ChannelQuery_channel_Channel | null };


export type ChannelQueryVariables = Types.Exact<{
  channelSlug: Types.Scalars['String']['input'];
}>;


export type ChannelQuery = ChannelQuery_Query;

export type CountriesQuery_shop_Shop_countries_CountryDisplay = { code: string, country: string };

export type CountriesQuery_shop_Shop = { countries: Array<CountriesQuery_shop_Shop_countries_CountryDisplay> };

export type CountriesQuery_Query = { shop: CountriesQuery_shop_Shop };


export type CountriesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CountriesQuery = CountriesQuery_Query;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const AddressValidationRulesQueryDocument = new TypedDocumentString(`
    query AddressValidationRulesQuery($countryCode: CountryCode!) {
  addressValidationRules(countryCode: $countryCode) {
    addressFormat
    allowedFields
    requiredFields
    countryAreaType
    postalCodeType
    cityType
    postalCodeExamples
    postalCodeMatchers
    countryAreaChoices {
      raw
      verbose
    }
  }
}
    `) as unknown as TypedDocumentString<AddressValidationRulesQuery, AddressValidationRulesQueryVariables>;
export const ChannelQueryDocument = new TypedDocumentString(`
    query ChannelQuery($channelSlug: String!) {
  channel(slug: $channelSlug) {
    countries {
      code
      country
    }
  }
}
    `) as unknown as TypedDocumentString<ChannelQuery, ChannelQueryVariables>;
export const CountriesQueryDocument = new TypedDocumentString(`
    query CountriesQuery {
  shop {
    countries {
      code
      country
    }
  }
}
    `) as unknown as TypedDocumentString<CountriesQuery, CountriesQueryVariables>;