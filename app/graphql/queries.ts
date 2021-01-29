/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getExtconfig = /* GraphQL */ `
  query GetExtconfig($id: ID!) {
    getExtconfig(id: $id) {
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
export const listExtconfigs = /* GraphQL */ `
  query ListExtconfigs(
    $filter: ModelExtconfigFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listExtconfigs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getLocation = /* GraphQL */ `
  query GetLocation($id: ID!) {
    getLocation(id: $id) {
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
export const listLocations = /* GraphQL */ `
  query ListLocations(
    $filter: ModelLocationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLocations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
