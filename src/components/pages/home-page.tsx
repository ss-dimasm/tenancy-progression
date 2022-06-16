import React, { FC, ReactNode, useCallback, useState } from 'react'

import { Loader, PageContainer, Pagination } from '@reapit/elements'

import { useGetPaginatedTenancies } from '../../platform-api/tenancy-api'
import TenanciesList from '../ui/home-page/tenancies-list'

export const HomePage: FC = () => {
  const [paginateTenancies, setPaginateTenancies] = useState<number>(1)
  const { data, isSuccess } = useGetPaginatedTenancies({
    pageNumber: paginateTenancies,
  })

  const renderJSXElement = useCallback(
    (fetchedData: typeof data): ReactNode => {
      if (fetchedData) {
        return (
          <>
            <TenanciesList tenanciesPagedData={fetchedData} />
            <Pagination
              callback={setPaginateTenancies}
              currentPage={paginateTenancies}
              numberPages={data?.totalPageCount ?? 0}
            />
          </>
        )
      }

      return <Loader fullPage label="Please wait" />
    },
    [isSuccess, paginateTenancies],
  )

  return (
    <>
      <PageContainer>{renderJSXElement(data)}</PageContainer>
    </>
  )
}

export default HomePage
