import React, { FC, useEffect, useMemo, useState } from 'react'

import { Button, ButtonGroup, FlexContainer, Icon, InputGroup, Loader, Select, Subtitle } from '@reapit/elements'
import {
  DocumentModel,
  DocumentModelPagedResult,
  TenancyCheckModelPagedResult,
  TenancyModel,
} from '@reapit/foundations-ts-definitions'
import { useFieldArray, useForm } from 'react-hook-form'
import { InfiniteData, UseMutationResult, useQueryClient } from 'react-query'

import { PatchSingleTenancyCheckParams, useFetchMultipleTenancyCheck } from '../../../platform-api/tenancy-api'
import { useFetchDocumentTenancyCheck } from '../../../platform-api/document-api'

type PreTenancyListProps = {
  tenancyData: NonNullable<TenancyModel>
  tenancyChecksData: InfiniteData<TenancyCheckModelPagedResult>

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

const generateMultipleTenancyChecks = (checksData: PreTenancyListProps['tenancyChecksData']): ListProps[] => {
  if (checksData && checksData.pages) {
    const currentField: ListProps[] = []
    checksData.pages.forEach((val) => {
      val!
        ._embedded!.filter((v) => v.type === 'preTenancy')
        .map(({ id, description, status, _eTag }, index) => {
          currentField.push({
            checkId: id!,
            index: index!,
            identity: 'default',
            type: 'preTenancy',
            description: description!,
            status: status!,
            _eTag: _eTag!,
          })
        })
    })
    return currentField
  }
  return []
}

const generateMultipleDocumentChecks = (docsData: InfiniteData<DocumentModelPagedResult>): DocumentModel[] => {
  if (docsData && docsData.pages) {
    const currentData: DocumentModel[] = []
    docsData.pages.forEach((val) => {
      val!._embedded?.map((v: DocumentModel) => {
        currentData.push(v)
      })
    })

    return currentData
  }
  return []
}

const PreTenancyList: FC<PreTenancyListProps> = ({ tenancyData, tenancyChecksData, handleTenancyCheckModal }) => {
  const queryClient = useQueryClient()

  const queryKeyTenancyChecks = ['get-infinite-tenancy-checks', tenancyData.id]
  const queryKeyMultipleDocumentsTenancyChecks = ['get-infinite-documents-tenancy-checks']

  const infiniteTenancyCheckQC = queryClient.getQueryState(queryKeyTenancyChecks)
  const infiniteDocsTenanciesChecksQC = queryClient.getQueryState(queryKeyMultipleDocumentsTenancyChecks)

  const [deletedFields, setDeletedFields] = useState<ListProps[]>([])

  const [isDataFetched, setIsDataFetched] = useState<boolean>(false)

  const { control, register, watch, handleSubmit, getValues, reset } = useForm<FormProps>({
    defaultValues: {
      name: 'tenancy-checks',
      checks: generateMultipleTenancyChecks(tenancyChecksData),
    },
  })

  useEffect(() => {
    if (isDataFetched) {
      reset({
        checks: generateMultipleTenancyChecks(tenancyChecksData),
      })
    }
  }, [isDataFetched])

  const { fields, remove } = useFieldArray({
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

  const onHandleSubmit = async (cb?: () => void) => {
    try {
      setIsDataFetched(false)
      const beforeMutate = generateMultipleTenancyChecks(tenancyChecksData)
      const currentFieldsValue = getValues()

      const updateTenancyChecksData = currentFieldsValue.checks
        .filter((curr) => curr.identity === 'default')
        .map((val) => ({
          ...val,
          eTag: val._eTag,
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
    } catch (e) {
      console.error(e)
    } finally {
      await queryClient.invalidateQueries(queryKeyTenancyChecks)
      setIsDataFetched(true)
      cb && cb()
      setDeletedFields([])
    }
  }

  const fetchDocs = useFetchDocumentTenancyCheck().getMultipleDocumentsTenancyCheck({
    tenancyChecksId: generateMultipleTenancyChecks(tenancyChecksData).map((v) => v.checkId!),
  })
  fetchDocs.hasNextPage && fetchDocs.fetchNextPage()

  const isOnMutateData = useMemo(() => {
    return (
      isLoadingCreateMultipleTenancyCheck || isLoadingUpdateMultipleTenancyCheck || isLoadingDeleteMultipleTenancyCheck
    )
  }, [isLoadingCreateMultipleTenancyCheck, isLoadingUpdateMultipleTenancyCheck, isLoadingDeleteMultipleTenancyCheck])

  const isDataLoading = useMemo(
    () => infiniteTenancyCheckQC?.isFetching && infiniteTenancyCheckQC && infiniteDocsTenanciesChecksQC?.isFetching,
    [infiniteTenancyCheckQC?.isFetching, infiniteDocsTenanciesChecksQC?.isFetching],
  )

  const availableDocumentsTenancyCheck = useMemo(
    () => generateMultipleDocumentChecks(fetchDocs.data!),
    [infiniteDocsTenanciesChecksQC?.isFetching],
  )
  // console.log(availableDocumentsTenancyCheck)

  return (
    <>
      <FlexContainer isFlexColumn className="el-wfull">
        <FlexContainer isFlexJustifyBetween>
          <Subtitle>Pre-Tenancy Checks</Subtitle>
          <ButtonGroup alignment="right">
            <Button
              onClick={handleSubmit(() => onHandleSubmit())}
              intent="primary"
              loading={isOnMutateData || isDataLoading}
              disabled={isOnMutateData || isDataLoading}
            >
              Save
            </Button>
          </ButtonGroup>
        </FlexContainer>
        {isDataLoading ? (
          <Loader label="please wait.." fullPage />
        ) : (
          <div className="el-mt6">
            {controlledFields.map((tenancyCheck, index) => {
              const isInputDisable =
                getValues(`checks.${index}.status`) === 'completed' ||
                getValues(`checks.${index}.status`) === 'notNeeded'
              const isHaveDocument = availableDocumentsTenancyCheck.some((v) => v.associatedId === tenancyCheck.checkId)

              return (
                <FlexContainer isFlexJustifyBetween isFlexAlignCenter key={tenancyCheck.id}>
                  <FlexContainer isFlexAlignCenter className="el-w7">
                    <InputGroup
                      type="text"
                      className="el-w10"
                      {...register(`checks.${index}.description`)}
                      disabled={isInputDisable}
                      intent="success"
                      icon={getValues(`checks.${index}.status`) === 'completed' ? 'checkSystem' : undefined}
                    />
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
                      intent={isHaveDocument ? 'secondary' : 'low'}
                      onClick={() => handleTenancyCheckModal().openModal(tenancyCheck as ListProps)}
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
        )}
      </FlexContainer>
    </>
  )
}
export default PreTenancyList
