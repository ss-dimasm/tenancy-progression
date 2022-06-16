import { useQuery } from 'react-query'
import { URLS } from '../constants/api'
import { Axios } from '../core/axios'

// ===========
// * Extend pagination
// ===========
export type PaginatedParams = {
  pageSize?: number
  pageNumber?: number
  sortBy?: string
}

type PaginatedPropertiesParameters = {
  id?: string[]
  age?: (
    | 'managed'
    | 'rentCollection'
    | 'collectFirstPayment'
    | 'collectRentToDate'
    | 'lettingOnly'
    | 'introducingTenant'
  )[]
  landlordId?: string[]
  lettingStatus?:
    | 'valuation'
    | 'toLet'
    | 'toLetUnavailable'
    | 'underOffer'
    | 'underOfferUnavailable'
    | 'arrangingTenancyUnavailable'
    | 'arrangingTenancy'
    | 'tenancyCurrentUnavailable'
    | 'tenancyCurrent'
    | 'tenancyFinished'
    | 'tenancyCancelled'
    | 'sold'
    | 'letByOtherAgent'
    | 'letPrivately'
    | 'provisional'
    | 'withdrawn'
  locality?: 'rural' | 'village' | 'townCity'
  marketingMode?: 'selling' | 'letting' | 'sellingAndLetting'
  masterId?: string[]
  officeId?: string[]
  parking?:
    | 'residents'
    | ' offStreet'
    | ' secure'
    | ' underground'
    | ' garage'
    | ' doubleGarage'
    | ' tripleGarage'
    | ' carport'
  sellingStatus?:
    | 'preAppraisal'
    | 'valuation'
    | 'paidValuation'
    | 'forSale'
    | 'forSaleUnavailable'
    | 'underOffer'
    | 'underOfferUnavailable'
    | 'reserved'
    | 'exchanged'
    | 'completed'
    | 'soldExternally'
    | 'withdrawn'
  situation?:
    | 'garden'
    | 'land'
    | 'patio'
    | 'roofTerrace'
    | 'conservatory'
    | 'balcony'
    | 'communalGardens'
    | 'outsideSpace'
  style?:
    | 'terraced'
    | 'endTerrace'
    | 'detached'
    | 'semiDetached'
    | 'linkDetached'
    | 'mews'
    | 'basement'
    | 'lowerGroundFloor'
    | 'groundFloor'
    | 'firstFloor'
    | 'upperFloor'
    | 'upperFloorWithLift'
    | 'penthouse'
    | 'duplex'
  type?:
    | 'house'
    | 'bungalow'
    | 'flatApartment'
    | 'maisonette'
    | 'land'
    | 'farm'
    | 'cottage'
    | 'studio'
    | 'townhouse'
    | 'developmentPlot'
  market?: 'local' | 'openA' | 'openB' | 'openC' | 'openD'
  address?: string
  countryId?: string
  departmentId?: string
  bedroomsFrom?: number
  bedroomsTo?: number
  priceFrom?: number
  priceTo?: number
  rentFrom?: number
  rentTo?: number
  rentFrequency?: 'weekly' | 'monthly' | 'annually'
  internetAdvertising?: boolean
  isExternal?: boolean
  fromArchive?: boolean
  availableFrom?: string
} & PaginatedParams

export const useGetPaginatedProperties = (params: PaginatedPropertiesParameters) => {
  return useQuery(['get-paginated-properties', params], async () => {
    const { data } = await Axios.get(URLS.PROPERTIES, {
      params: { ...params },
    })
    return data
  })
}

// ==========
// * SINGLE PROPERTY FETCH
// ==========
// export const useFetchSingleProperty = (params: any) => {
//   //
// }
