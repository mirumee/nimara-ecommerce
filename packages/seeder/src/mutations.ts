import { gql } from "graphql-request";

export const CATEGORY_CREATE_MUTATION = gql`
  mutation CategoryCreate($input: CategoryInput!, $parent: ID) {
    categoryCreate(input: $input, parent: $parent) {
      errors {
        field
        message
      }
      category {
        id
        name
        slug
      }
    }
  }
`;

export const ATTRIBUTE_BULK_CREATE_MUTATION = gql`
  mutation AttributeBulkCreate($input: [AttributeCreateInput!]!) {
    attributeBulkCreate(attributes: $input) {
      results {
        attribute {
          id
          name
        }
        errors {
          path
          message
        }
      }
      count
    }
  }
`;

export const PAGE_TYPE_CREATE_MUTATION = gql`
  mutation PageTypeCreate($input: PageTypeCreateInput!) {
    pageTypeCreate(input: $input) {
      pageType {
        id
        name
        slug
        attributes {
          id
          name
        }
      }
      errors {
        field
        message
      }
    }
  }
`;

export const PAGE_CREATE_MUTATION = gql`
  mutation PageCreate($input: PageCreateInput!) {
    pageCreate(input: $input) {
      page {
        id
        title
        slug
      }
      errors {
        field
        message
      }
    }
  }
`;

export const PAGE_UPDATE_MUTATION = gql`mutation PageUpdate($id: ID!, $input: PageInput!) {
      pageUpdate(id: $id, input: $input) {
        page {
          id
        }
        errors {
          field
          message
        }
      }
    }`

export const MENU_CREATE_MUTATION = gql`
  mutation MenuCreate($input: MenuCreateInput!) {
    menuCreate(input: $input) {
      menu {
        id
        name
      }
      errors {
        field
        message
      }
    }
  }
`;

export const MENU_ITEM_CREATE_MUTATION = gql`
  mutation MenuItemCreate($input: MenuItemCreateInput!) {
    menuItemCreate(input: $input) {
      menuItem {
        id
        name
      }
      errors {
        field
        message
      }
    }
  }
`;

export const PRODUCT_TYPE_CREATE_MUTATION = gql`
  mutation ProductTypeCreate($input: ProductTypeInput!) {
    productTypeCreate(input: $input) {
      productType {
        id
        name
      }
      errors {
        field
        message
      }
    }
  }
`;

export const PRODUCT_MEDIA_CREATE_MUTATION = gql`
  mutation ProductMediaCreate($productId: ID!, $file: Upload!) {
    productMediaCreate(
      input: {
        product: $productId
        image: $file
        alt: "Product image"
      }
    ) {
      media {
        id
        url
      }
      errors {
        field
        message
      }
    }
  }
`;

export const PRODUCT_BULK_CREATE_MUTATION = gql`
  mutation ProductBulkCreate($input: [ProductBulkCreateInput!]!) {
    productBulkCreate(products: $input) {
      results {
        product {
          id
          name
        }
        errors {
          path
          message
        }
      }
      count
    }
  }
`;

export const PRODUCT_VARIANT_CREATE_MUTATION = gql`
  mutation ProductVariantCreate($input: ProductVariantCreateInput!) {
    productVariantCreate(input: $input) {
      productVariant {
        id
        name
      }
      errors {
        field
        message
      }
    }
  }
`;

export const PRODUCT_CHANNEL_LISTING_UPDATE_MUTATION = gql`
  mutation ProductChannelListingUpdate($id: ID!, $input: ProductChannelListingUpdateInput!) {
    productChannelListingUpdate(id: $id, input: $input) {
      product {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;

export const PAGE_REORDER_ATTRIBUTES_MUTATION = gql`
  mutation PageReorderAttributes($pageTypeId: ID!, $moves: [ReorderInput!]!) {
    pageTypeReorderAttributes(pageTypeId: $pageTypeId, moves: $moves) {
      pageType {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;

export const CATEGORY_BULK_DELETE_MUTATION = gql`
  mutation CategoryBulkDelete($ids: [ID!]!) {
    categoryBulkDelete(ids: $ids) {
      count
      errors {
        field
        message
      }
    }
  }
`;

export const PRODUCT_BULK_DELETE_MUTATION = gql`
  mutation ProductBulkDelete($ids: [ID!]!) {
    productBulkDelete(ids: $ids) {
      count
      errors {
        field
        message
      }
    }
  }
`;

export const PRODUCT_TYPE_BULK_DELETE_MUTATION = gql`
  mutation ProductTypeBulkDelete($ids: [ID!]!) {
    productTypeBulkDelete(ids: $ids) {
      count
      errors {
        field
        message
      }
    }
  }
`;

export const PAGE_BULK_DELETE_MUTATION = gql`
  mutation PageBulkDelete($ids: [ID!]!) {
    pageBulkDelete(ids: $ids) {
      count
      errors {
        field
        message
      }
    }
  }
`;

export const PAGE_TYPE_BULK_DELETE_MUTATION = gql`
  mutation PageTypeBulkDelete($ids: [ID!]!) {
    pageTypeBulkDelete(ids: $ids) {
      count
      errors {
        field
        message
      }
    }
  }
`;

export const ATTRIBUTE_BULK_DELETE_MUTATION = gql`
  mutation AttributeBulkDelete($ids: [ID!]!) {
    attributeBulkDelete(ids: $ids) {
      count
      errors {
        field
        message
      }
    }
  }
`;

export const MENU_BULK_DELETE_MUTATION = gql`
  mutation MenuBulkDelete($ids: [ID!]!) {
    menuBulkDelete(ids: $ids) {
      count
      errors {
        field
        message
      }
    }
  }
`;

export const PAGE_TYPE_ASSIGN_ATTRIBUTES_MUTATION = gql`
  mutation AssignPageTypeAttributes(
    $pageTypeId: ID!
    $attributeIds: [ID!]!
  ) {
    pageAttributeAssign(
      pageTypeId: $pageTypeId
      attributeIds: $attributeIds
    ) {
      pageType {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;
