import { DocumentModelPagedResult } from '@reapit/foundations-ts-definitions'
import { useMutation, useQuery } from 'react-query'

import { URLS } from '../constants/api'
import { Axios } from '../core/axios'

export const useFetchDocumentTenancyCheck = () => {
  const getDocumentTenancyCheck = (tenancyCheckIdParams: string | null) => {
    return useQuery(
      ['tenancy-check-document', tenancyCheckIdParams],
      async () => {
        const { data } = await Axios.get<DocumentModelPagedResult>(URLS.DOCUMENTS, {
          params: {
            associatedType: 'tenancyCheck',
            associatedId: tenancyCheckIdParams,
          },
        })
        return data
      },
      {
        enabled: !!tenancyCheckIdParams,
      },
    )
  }

  const createDocumentTenancyCheck = (tenancyCheckIdParams: string) => {
    return useMutation(
      ['create-document-tenancy', tenancyCheckIdParams],
      async (bodyParams: CreateDocumentTenancyCheck) => {
        const { data } = await Axios.post(URLS.DOCUMENTS, {
          associatedType: 'tenancyCheck',
          associatedId: tenancyCheckIdParams,
          ...bodyParams,
        })

        return data
      },
    )
  }

  return {
    getDocumentTenancyCheck,
    createDocumentTenancyCheck,
  }
}

export type CreateDocumentTenancyCheck = {
  typeId: string
  name: string
  isPrivate?: boolean
  fileData?: string
  fileUrl?: string
}
