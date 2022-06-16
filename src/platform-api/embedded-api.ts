import { useQuery } from 'react-query'
import { Axios } from '../core/axios'

type FetchGetLinksType = {
  href: string
}

export const useFetchGetLinks = <T>(params: FetchGetLinksType) => {
  return useQuery(['fetch-get-embedded', params], async () => {
    const { data } = await Axios.get<T>(params.href)

    return data
  })
}
