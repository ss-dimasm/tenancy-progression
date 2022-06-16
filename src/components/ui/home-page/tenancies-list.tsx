import React, { FC } from 'react'

import { TenancyModelPagedResult } from '@reapit/foundations-ts-definitions'
import { Card, FlexContainer } from '@reapit/elements'
import { useHistory } from 'react-router'

type TenanciesListType = {
  tenanciesPagedData: TenancyModelPagedResult
}

const TenanciesList: FC<TenanciesListType> = ({ tenanciesPagedData }) => {
  const { push } = useHistory()

  return (
    <>
      <FlexContainer isFlexWrap isFlexJustifyCenter>
        {tenanciesPagedData._embedded?.map((tenancy) => {
          return (
            <Card
              key={tenancy.id}
              hasMainCard
              mainCardHeading="yo"
              className="el-w3 el-m3"
              onClick={() => push(`tenancy/${tenancy.id}`)}
            />
          )
        })}
      </FlexContainer>
    </>
  )
}

export default TenanciesList
