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

  const editDocumentTenancyCheck = (tenancyCheckIdParams: string) => {
    return useMutation(
      ['patch-document-tenancy', tenancyCheckIdParams],
      async ({ IfMatch, ...bodyParams }: PatchDocumentTenancyCheck) => {
        const { data } = await Axios.patch(
          `${URLS.DOCUMENTS}${tenancyCheckIdParams}`,
          {
            ...bodyParams,
          },
          {
            headers: {
              ['If-Match']: IfMatch,
            },
          },
        )
        return data
      },
    )
  }

  const deleteDocumentTenancyCheck = (tenancyCheckIdParams: string) => {
    return useMutation(['delete-tenancy-check', tenancyCheckIdParams], async () => {
      const { data } = await Axios.delete(`${URLS.DOCUMENTS}${tenancyCheckIdParams}`)
      return data
    })
  }

  const downloadDocumentTenancyCheck = () => {
    return useMutation(
      ['download-document-tenancy-check'],
      async ({ tenancyCheckIdParams }: { tenancyCheckIdParams: string; documentNameParams: string }) => {
        const { data } = await Axios.get(`${URLS.DOCUMENTS}${tenancyCheckIdParams}/download`, {
          responseType: 'blob',
          headers: {
            accept: 'application/octet-stream',
          },
        })

        return data
      },
      {
        onSuccess: (data, variable) => {
          const url = window.URL.createObjectURL(data)
          const link = document.createElement('a')
          link.href = url
          const fileName = variable.documentNameParams //
          link.setAttribute('download', fileName)
          document.body.appendChild(link)
          link.click()
          link.remove()
        },
      },
    )
  }

  return {
    getDocumentTenancyCheck,
    createDocumentTenancyCheck,
    deleteDocumentTenancyCheck,
    editDocumentTenancyCheck,
    downloadDocumentTenancyCheck,
  }
}

export type CreateDocumentTenancyCheck = {
  typeId: string
  name: string
  isPrivate?: boolean
  fileData?: string
  fileUrl?: string
}

export type PatchDocumentTenancyCheck = {
  IfMatch: string
  typeId: string
  name: string
}
