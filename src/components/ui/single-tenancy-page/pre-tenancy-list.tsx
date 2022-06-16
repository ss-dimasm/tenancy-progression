import React, { FC } from 'react'

import { Button, FlexContainer, Icon, Input, Select, Subtitle } from '@reapit/elements'
import { TenancyCheckModelPagedResult, TenancyModel } from '@reapit/foundations-ts-definitions'
import { useFieldArray, useForm } from 'react-hook-form'
import { PatchSingleTenancyCheckParams } from '../../../platform-api/tenancy-api'
import { UseMutationResult, useQueryClient } from 'react-query'

type PreTenancyListProps = {
  tenancyData: NonNullable<TenancyModel>
  tenancyChecksData: NonNullable<TenancyCheckModelPagedResult>

  patchSingleTenancyChecks: () => UseMutationResult<any, unknown, PatchSingleTenancyCheckParams, unknown>
  handleTenancyCheckModal: () => {
    openModal: (params: string) => void
    closeModal: () => void
  }
}

type ListProps = {
  id?: string
  index?: number
  description?: string
  status?: string
}

type FormProps = {
  name: string
  checks: ListProps[]
}

const generateFieldValue = (checksData: PreTenancyListProps['tenancyChecksData']): ListProps[] => {
  if (checksData && checksData._embedded?.length) {
    return checksData._embedded
      .filter((v) => v.type === 'preTenancy')
      .map(({ id, description, status }, index) => ({
        id,
        index,
        description,
        status,
      }))
  }
  return []
}

const PreTenancyList: FC<PreTenancyListProps> = ({
  tenancyChecksData,
  patchSingleTenancyChecks,
  handleTenancyCheckModal,
}) => {
  const queryClient = useQueryClient()

  // console.log(tenancyChecksData._embedded?.[0]._eTag)
  const { control, register, watch, handleSubmit, getValues } = useForm<FormProps>({
    defaultValues: {
      name: 'tenancy-checks',
      checks: generateFieldValue(tenancyChecksData),
    },
  })

  const { fields } = useFieldArray({
    control,
    name: 'checks',
  })

  const watchFieldArray = watch('checks')
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index],
    }
  })

  const { mutateAsync } = patchSingleTenancyChecks()

  const handleSubmitClick = () => {
    const beforeMutate = generateFieldValue(tenancyChecksData)

    const filtered = getValues().checks.filter((currentCheck, index) => {
      return (
        currentCheck.status !== beforeMutate[index].status ||
        currentCheck.description !== beforeMutate[index].description
      )
    })

    filtered.forEach(async ({ status, description, ...rest }) => {
      await mutateAsync(
        {
          status: status!,
          checkId: rest.id!,
          IfMatch: tenancyChecksData._embedded?.[rest.index!]._eTag!,
          description: description!,
        },
        {
          onSettled: () => {
            queryClient.invalidateQueries([
              'get-single-tenancy-checks',
              { id: tenancyChecksData._embedded?.[rest.index!].tenancyId! },
            ])
          },
        },
      )
    })
  }

  return (
    <FlexContainer isFlexColumn className="el-wfull">
      <FlexContainer isFlexJustifyBetween>
        <Subtitle>Pre-Tenancy Checks</Subtitle>
        <Button onClick={handleSubmit(handleSubmitClick)} intent="primary">
          Save
        </Button>
      </FlexContainer>
      <div className="el-mt6">
        {controlledFields.map((tenancyCheck, index) => {
          return (
            <FlexContainer isFlexJustifyBetween isFlexAlignCenter key={tenancyCheck.id}>
              <FlexContainer isFlexAlignCenter className="el-w7">
                <Input type="text" className="el-w10" {...register(`checks.${index}.description`)} />
                <Select {...register(`checks.${index}.status`)}>
                  <option value="needed">Needed</option>
                  <option value="notNeeded">Not Needed</option>
                  <option value="arranged">Sent / Arranging</option>
                  <option value="completed">Completed</option>
                </Select>
              </FlexContainer>
              <FlexContainer isFlexAlignCenter className="el-w5" isFlexJustifyEnd>
                <Icon
                  icon="linkSystem"
                  className="el-mr5"
                  onClick={() => handleTenancyCheckModal().openModal(tenancyCheck.id)}
                />
                <Icon icon="closeSystem" intent="danger" />
              </FlexContainer>
            </FlexContainer>
          )
        })}
      </div>
    </FlexContainer>
  )
}
export default PreTenancyList
