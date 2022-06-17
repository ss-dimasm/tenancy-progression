import React, { FC, useCallback, useEffect, useState } from 'react'

import { Button, ButtonGroup, FlexContainer, Icon, Input, Select, Subtitle, useModal } from '@reapit/elements'
import { TenancyCheckModelPagedResult, TenancyModel } from '@reapit/foundations-ts-definitions'
import { useFieldArray, useForm } from 'react-hook-form'
import { UseMutationResult, useQueryClient } from 'react-query'

import { PatchSingleTenancyCheckParams, useFetchMultipleTenancyCheck } from '../../../platform-api/tenancy-api'

type PreTenancyListProps = {
  tenancyData: NonNullable<TenancyModel>
  tenancyChecksData: NonNullable<TenancyCheckModelPagedResult>

  patchSingleTenancyChecks: () => UseMutationResult<any, unknown, PatchSingleTenancyCheckParams, unknown>
  handleTenancyCheckModal: () => {
    openModal: (params: ListProps) => void
    closeModal: () => void
  }
}

export type ListProps = {
  checkId?: string
  index?: number
  identity: 'default' | 'new' | 'delete'
  type: string
  description: string
  status: string
  _eTag?: string
}

type FormProps = {
  name: string
  checks: ListProps[]
}

const generateFieldValue = (checksData: PreTenancyListProps['tenancyChecksData']): ListProps[] => {
  if (checksData && checksData._embedded?.length) {
    return checksData._embedded
      .filter((v) => v.type === 'preTenancy')
      .map(({ id, description, status, _eTag }, index) => ({
        checkId: id!,
        index: index!,
        identity: 'default',
        type: 'preTenancy',
        description: description!,
        status: status!,
        _eTag: _eTag!,
      }))
  }
  return []
}

const PreTenancyList: FC<PreTenancyListProps> = ({ tenancyData, tenancyChecksData, handleTenancyCheckModal }) => {
  const queryClient = useQueryClient()

  const queryKey = ['get-single-tenancy-checks', { id: tenancyData.id }]

  const [deletedFields, setDeletedFields] = useState<ListProps[]>([])

  // * Indicate for resetting fields based passed tenancyChecksData
  const [isDataFetched, setIsDataFetched] = useState<boolean>(false)

  const { control, register, watch, handleSubmit, getValues, reset } = useForm<FormProps>({
    defaultValues: {
      name: 'tenancy-checks',
      checks: generateFieldValue(tenancyChecksData),
    },
  })

  useEffect(() => {
    if (isDataFetched) {
      reset({
        checks: generateFieldValue(tenancyChecksData),
      })
    }
  }, [isDataFetched])

  const { fields, append, remove } = useFieldArray({
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

  const { updateMultipleTenancyCheck, deleteMultipleTenancyCheck, createMultipleTenancyCheck } =
    useFetchMultipleTenancyCheck(tenancyData.id!)

  const { mutateAsync: mutateAsyncCreateMultipleTenancyCheck, isLoading: isLoadingCreateMultipleTenancyCheck } =
    createMultipleTenancyCheck()
  const { mutateAsync: mutateAsyncUpdateMultipleTenancyCheck, isLoading: isLoadingUpdateMultipleTenancyCheck } =
    updateMultipleTenancyCheck()
  const { mutateAsync: mutateAsyncDeleteMultipleTenancyCheck, isLoading: isLoadingDeleteMultipleTenancyCheck } =
    deleteMultipleTenancyCheck()

  const isLoading =
    isLoadingCreateMultipleTenancyCheck || isLoadingUpdateMultipleTenancyCheck || isLoadingDeleteMultipleTenancyCheck

  const handleSubmitClick = async (cb?: () => void) => {
    try {
      setIsDataFetched(false)
      const beforeMutate = generateFieldValue(tenancyChecksData)
      const currentFieldsValue = getValues()

      const updateTenancyChecksData = currentFieldsValue.checks
        .filter((curr) => curr.identity === 'default')
        .map((val) => ({
          ...val,
          eTag: tenancyChecksData._embedded?.[val.index!]._eTag,
        }))
        .filter((currentCheck) => {
          const beforeIndex = beforeMutate.filter((curr) => curr.checkId === currentCheck.checkId)[0]
          return currentCheck.status !== beforeIndex.status || currentCheck.description !== beforeIndex.description
        })
      const createTenancyChecksData = currentFieldsValue.checks.filter((curr) => curr.identity === 'new')
      const deleteTenancyChecksData = deletedFields.filter((curr) => curr.checkId !== undefined)

      await mutateAsyncCreateMultipleTenancyCheck(createTenancyChecksData)
      await mutateAsyncDeleteMultipleTenancyCheck(deleteTenancyChecksData)
      await mutateAsyncUpdateMultipleTenancyCheck(updateTenancyChecksData)

      return 'ok'
    } catch (e) {
      console.error(e)
    } finally {
      await queryClient.invalidateQueries(queryKey)
      setIsDataFetched(true)
      cb && cb()
      setDeletedFields([])
    }
  }

  const { Modal: TenancyCheckModal, ...modalRest } = useModal('modal-root')

  const handleTenancyCheckListModal = useCallback(() => {
    const openModal = () => {
      const field: ListProps = {
        description: '',
        status: 'needed',
        type: 'preTenancy',
        identity: 'new',
      }
      append(field)
    }

    const closeModal = () => {
      modalRest.closeModal()
    }

    return {
      openModal,
      closeModal,
    }
  }, [])

  return (
    <>
      <FlexContainer isFlexColumn className="el-wfull">
        <FlexContainer isFlexJustifyBetween>
          <Subtitle>Pre-Tenancy Checks</Subtitle>
          <ButtonGroup alignment="right">
            <Button
              onClick={handleSubmit(() => handleSubmitClick())}
              intent="primary"
              loading={isLoading}
              disabled={isLoading}
            >
              Save
            </Button>
            <Button onClick={handleTenancyCheckListModal().openModal} loading={isLoading} disabled={isLoading}>
              Add Fields
            </Button>
          </ButtonGroup>
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
                    onClick={async () => {
                      if (tenancyCheck.checkId) {
                        handleTenancyCheckModal().openModal(tenancyCheck as ListProps)
                      } else {
                        console.log('before')
                        await handleSubmitClick()
                        console.log('after')
                        // create
                      }
                    }}
                  />
                  <Icon
                    icon="closeSystem"
                    intent="danger"
                    onClick={() => {
                      setDeletedFields((prev) => [...prev, tenancyCheck])
                      remove(index)
                    }}
                  />
                </FlexContainer>
              </FlexContainer>
            )
          })}
        </div>
      </FlexContainer>
      <TenancyCheckModal>
        <h1>Add here</h1>
      </TenancyCheckModal>
    </>
  )
}
export default PreTenancyList
