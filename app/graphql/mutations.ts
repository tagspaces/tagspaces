/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createExtconfig = /* GraphQL */ `
  mutation CreateExtconfig(
    $input: CreateExtconfigInput!
    $condition: ModelExtconfigConditionInput
  ) {
    createExtconfig(input: $input, condition: $condition) {
      id
      tenant
      LogoURL
      ShowAdvancedSearch
      SidebarColor
      SidebarSelectionColor
      LightThemeLightColor
      LightThemeMainColor
      DarkThemeLightColor
      DarkThemeMainColor
      IsFirstRun
      Locations {
        items {
          id
          tenant
          uuid
          type
          name
          path
          accessKeyId
          secretAccessKey
          bucketName
          region
          isDefault
          isReadOnly
          persistIndex
          fullTextIndex
          watchForChanges
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const updateExtconfig = /* GraphQL */ `
  mutation UpdateExtconfig(
    $input: UpdateExtconfigInput!
    $condition: ModelExtconfigConditionInput
  ) {
    updateExtconfig(input: $input, condition: $condition) {
      id
      tenant
      LogoURL
      ShowAdvancedSearch
      SidebarColor
      SidebarSelectionColor
      LightThemeLightColor
      LightThemeMainColor
      DarkThemeLightColor
      DarkThemeMainColor
      IsFirstRun
      Locations {
        items {
          id
          tenant
          uuid
          type
          name
          path
          accessKeyId
          secretAccessKey
          bucketName
          region
          isDefault
          isReadOnly
          persistIndex
          fullTextIndex
          watchForChanges
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const deleteExtconfig = /* GraphQL */ `
  mutation DeleteExtconfig(
    $input: DeleteExtconfigInput!
    $condition: ModelExtconfigConditionInput
  ) {
    deleteExtconfig(input: $input, condition: $condition) {
      id
      tenant
      LogoURL
      ShowAdvancedSearch
      SidebarColor
      SidebarSelectionColor
      LightThemeLightColor
      LightThemeMainColor
      DarkThemeLightColor
      DarkThemeMainColor
      IsFirstRun
      Locations {
        items {
          id
          tenant
          uuid
          type
          name
          path
          accessKeyId
          secretAccessKey
          bucketName
          region
          isDefault
          isReadOnly
          persistIndex
          fullTextIndex
          watchForChanges
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const createLocation = /* GraphQL */ `
  mutation CreateLocation(
    $input: CreateLocationInput!
    $condition: ModelLocationConditionInput
  ) {
    createLocation(input: $input, condition: $condition) {
      id
      tenant
      configId {
        id
        tenant
        LogoURL
        ShowAdvancedSearch
        SidebarColor
        SidebarSelectionColor
        LightThemeLightColor
        LightThemeMainColor
        DarkThemeLightColor
        DarkThemeMainColor
        IsFirstRun
        Locations {
          nextToken
        }
        createdAt
        updatedAt
      }
      uuid
      type
      name
      path
      accessKeyId
      secretAccessKey
      bucketName
      region
      isDefault
      isReadOnly
      persistIndex
      fullTextIndex
      watchForChanges
      createdAt
      updatedAt
    }
  }
`;
export const updateLocation = /* GraphQL */ `
  mutation UpdateLocation(
    $input: UpdateLocationInput!
    $condition: ModelLocationConditionInput
  ) {
    updateLocation(input: $input, condition: $condition) {
      id
      tenant
      configId {
        id
        tenant
        LogoURL
        ShowAdvancedSearch
        SidebarColor
        SidebarSelectionColor
        LightThemeLightColor
        LightThemeMainColor
        DarkThemeLightColor
        DarkThemeMainColor
        IsFirstRun
        Locations {
          nextToken
        }
        createdAt
        updatedAt
      }
      uuid
      type
      name
      path
      accessKeyId
      secretAccessKey
      bucketName
      region
      isDefault
      isReadOnly
      persistIndex
      fullTextIndex
      watchForChanges
      createdAt
      updatedAt
    }
  }
`;
export const deleteLocation = /* GraphQL */ `
  mutation DeleteLocation(
    $input: DeleteLocationInput!
    $condition: ModelLocationConditionInput
  ) {
    deleteLocation(input: $input, condition: $condition) {
      id
      tenant
      configId {
        id
        tenant
        LogoURL
        ShowAdvancedSearch
        SidebarColor
        SidebarSelectionColor
        LightThemeLightColor
        LightThemeMainColor
        DarkThemeLightColor
        DarkThemeMainColor
        IsFirstRun
        Locations {
          nextToken
        }
        createdAt
        updatedAt
      }
      uuid
      type
      name
      path
      accessKeyId
      secretAccessKey
      bucketName
      region
      isDefault
      isReadOnly
      persistIndex
      fullTextIndex
      watchForChanges
      createdAt
      updatedAt
    }
  }
`;
