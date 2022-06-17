import {
  TenancyCheckModelPagedResult,
  TenancyContactRelationshipModelPagedResult,
  TenancyModel,
  TenancyModelPagedResult,
} from '@reapit/foundations-ts-definitions'
import { useMutation, useQuery } from 'react-query'
import { stringify } from 'qs'

import { URLS } from '../constants/api'
import { Axios } from '../core/axios'
import { ListProps } from '../components/ui/single-tenancy-page/pre-tenancy-list'

export const useFetchSingleTenancy = (params: TenancySingleResultQuery) => {
  // * get single tenancy data
  const getSingleTenancy = (additionalParams?: GetSingleTenancyAdditionalParams) => {
    return useQuery(['get-single-tenancy', params], async () => {
      const { data } = await Axios.get<TenancyModel>(`${URLS.TENANCIES}${params.id}`, {
        params: {
          ...additionalParams,
        },
        paramsSerializer: (params) =>
          stringify(params, {
            arrayFormat: 'repeat',
          }),
      })
      return data
    })
  }

  // * post single tenancy data
  const postSingleTenancy = () => {
    return useMutation(['post-single-tenancy', params], async (requestParams: MutationSingleTenancyRequest) => {
      const data = await Axios.post(URLS.TENANCIES, {
        ...requestParams,
      })
      return data
    })
  }

  // * patch single tenancy
  const patchSingleTenancy = (additionalParams: PatchSingleTenancyAdditionalParams) => {
    return useMutation(['patch-single-tenancy', params], async (bodyParams: MutationSingleTenancyRequest) => {
      const data = await Axios.patch(
        `${URLS.TENANCIES}${params.id}`,
        {
          ...bodyParams,
        },
        {
          headers: {
            ['If-Match']: additionalParams.IfMatch,
          },
        },
      )
      return data
    })
  }

  // * get single tenancy relationship
  const getSingleTenancyRelationship = (additionalParams?: PaginatedParams) => {
    return useQuery(['get-single-tenancy-relationship', params], async () => {
      const { data } = await Axios.get<TenancyContactRelationshipModelPagedResult>(
        `${URLS.TENANCIES}${params.id}/relationships`,
        {
          params: {
            ...additionalParams,
          },
        },
      )
      return data
    })
  }

  // * get single tenancy check
  const getSingleTenancyChecks = (additionalParams?: PaginatedParams) => {
    return useQuery(['get-single-tenancy-checks', params], async () => {
      const { data } = await Axios.get<TenancyCheckModelPagedResult>(`${URLS.TENANCIES}${params.id}/checks`, {
        params: {
          ...additionalParams,
        },
      })
      return data
    })
  }

  // * post single tenancy checks
  const postSingleTenancyChecks = () => {
    return useMutation(['post-single-tenancy-check'], async (tenancy: ListProps) => {
      const { data } = await Axios.post(`${URLS.TENANCIES}${params.id}/checks`, {
        description: tenancy.description,
        type: tenancy.type,
        status: tenancy.status,
      })
      return data
    })
  }

  // * update single tenancy check
  const patchSingleTenancyChecks = () => {
    return useMutation(['patch-single-tenancy-checks'], async (mutateParams: PatchSingleTenancyCheckParams) => {
      const { data } = await Axios.patch(
        `${URLS.TENANCIES}${params.id}/checks/${mutateParams.checkId}`,
        {
          description: mutateParams.description,
          status: mutateParams.status,
        },
        {
          headers: {
            ['If-Match']: mutateParams.IfMatch,
          },
        },
      )
      return data
    })
  }

  return {
    getSingleTenancy,
    postSingleTenancy,
    patchSingleTenancy,
    getSingleTenancyRelationship,
    getSingleTenancyChecks,
    postSingleTenancyChecks,
    patchSingleTenancyChecks,
  }
}

export const useFetchMultipleTenancyCheck = (tenancyId: string) => {
  const createMultipleTenancyCheck = () => {
    return useMutation(['create-tenancy-checks', tenancyId], async (tenancies: ListProps[]) => {
      return Promise.allSettled(
        tenancies.map(async (tenancy: ListProps) => {
          const { data } = await Axios.post(`${URLS.TENANCIES}${tenancyId}/checks`, {
            description: tenancy.description,
            type: tenancy.type,
            status: tenancy.status,
          })
          return data
        }),
      )
    })
  }

  const deleteMultipleTenancyCheck = () => {
    return useMutation(['delete-tenancy-checks', tenancyId], async (tenancies: ListProps[]) => {
      return Promise.allSettled(
        tenancies.map(async (tenancy) => {
          const { data } = await Axios.delete(`${URLS.TENANCIES}${tenancyId}/checks/${tenancy.checkId}`)
          return data
        }),
      )
    })
  }

  const updateMultipleTenancyCheck = () => {
    return useMutation((tenancies: ListProps[]) => {
      return Promise.allSettled(
        tenancies.map(async (tenancy) => {
          const { data } = await Axios.patch(
            `${URLS.TENANCIES}${tenancyId}/checks/${tenancy.checkId}`,
            {
              description: tenancy.description!,
              status: tenancy.status!,
            },
            {
              headers: {
                ['If-Match']: tenancy._eTag!,
              },
            },
          )
          return data
        }),
      )
    })
  }

  return {
    createMultipleTenancyCheck,
    updateMultipleTenancyCheck,
    deleteMultipleTenancyCheck,
  }
}

// ===========
// * Extend pagination
// ===========
export type PaginatedParams = {
  pageSize?: number
  pageNumber?: number
}

type TenanciesPagedResultParams = {
  id?: string
  negotiatorId?: string
  applicantId?: string
  propertyId?: string
  status?: 'offerPending' | 'offerWithdrawn' | 'offerRejected' | 'arranging' | 'current' | 'finished' | 'cancelled'
  email?: string[]
  embed?: ('appointments' | 'applicant' | 'documents' | 'negotiator' | 'property' | 'source' | 'tasks' | 'type')[]
} & PaginatedParams

export const useGetPaginatedTenancies = (params: TenanciesPagedResultParams) => {
  return useQuery(['get-paginated-tenancies', params], async () => {
    const { data } = await Axios.get<TenancyModelPagedResult>(URLS.TENANCIES, {
      params,
      paramsSerializer: (params) =>
        stringify(params, {
          arrayFormat: 'repeat',
        }),
    })
    return data
  })
}

type MutationSingleTenancyRequest = {
  typeId: string
  negotiatorId: string
  propertyId: string
  applicantId: string
  agentRole:
    | 'managed'
    | 'rentCollection'
    | 'collectFirstPayment'
    | 'collectRentToDate'
    | 'lettingOnly'
    | 'introducingTenant'
  rent: number
  rentFrequency: 'weekly' | 'monthly' | 'annually'

  startDate?: string
  endDate?: string
  status?: 'offerPending' | 'offerWithdrawn' | 'offerRejected' | 'arranging'
  rentInstalmentsFrequency?: string
  rentInstalmentsAmount?: string
  rentInstalmentsStart?: string
  meterReadingGas?: string
  meterReadingGasLastRead?: string
  meterReadingElectricity?: string
  meterReadingElectricityLastRead?: string
  meterReadingWater?: string
  meterReadingWaterLastRead?: string
  isPeriodic?: string
  source?: {
    id: string
    type: string
  }
}

type TenancySingleResultQuery = {
  id: string
}

type GetSingleTenancyAdditionalParams = {
  embed: TenanciesPagedResultParams['embed']
}

type PatchSingleTenancyAdditionalParams = {
  IfMatch: string
}

export type PatchSingleTenancyCheckParams = {
  checkId: string
  status: string
  description: string
} & PatchSingleTenancyAdditionalParams
