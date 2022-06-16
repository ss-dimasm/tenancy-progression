import { ReapitConnectSession } from '@reapit/connect-session'
import { ListItemModel } from '@reapit/foundations-ts-definitions'
import { useQuery } from 'react-query'
import { URLS, BASE_HEADERS } from '../constants/api'
import { Axios } from '../core/axios'

export const configurationAppointmentsApiService = async (
  session: ReapitConnectSession | null,
): Promise<ListItemModel[] | undefined> => {
  try {
    if (!session) return

    const response = await fetch(`${window.reapit.config.platformApiUrl}${URLS.CONFIGURATION_APPOINTMENT_TYPES}`, {
      method: 'GET',
      headers: {
        ...BASE_HEADERS,
        Authorization: `Bearer ${session?.accessToken}`,
      },
    })

    if (response.ok) {
      const responseJson: Promise<ListItemModel[] | undefined> = response.json()
      return responseJson
    }

    throw new Error('No response returned by API')
  } catch (err) {
    const error = err as Error
    console.error('Error fetching Configuration Appointment Types', error.message)
  }
}

export const useFetchConfiguration = () => {
  const getDocumentTypes = () => {
    return useQuery('document-types', async () => {
      const { data } = await Axios.get<ListItemModel[]>(URLS.CONFIGURATION_DOCUMENT_TYPES)
      return data
    })
  }

  return {
    getDocumentTypes,
  }
}
