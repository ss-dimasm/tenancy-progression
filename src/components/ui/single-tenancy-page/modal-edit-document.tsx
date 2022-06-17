import React, { FC, FormEvent } from 'react'

import { Button, ButtonGroup, FlexContainer, Input, Select } from '@reapit/elements'
import { DocumentModel, ListItemModel } from '@reapit/foundations-ts-definitions'
import { useForm } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import { useFetchDocumentTenancyCheck } from '../../../platform-api/document-api'

type ModalEditDocumentProps = {
  documentData: DocumentModel
  closeModal: () => void
}

const ModalEditDocument: FC<ModalEditDocumentProps> = ({ documentData, closeModal }) => {
  const queryClient = useQueryClient()
  const documentTypesData = queryClient.getQueryData<ListItemModel[]>('document-types')

  const { editDocumentTenancyCheck } = useFetchDocumentTenancyCheck()

  const { mutateAsync, isLoading } = editDocumentTenancyCheck(documentData.id!)

  const { register, getValues } = useForm({
    defaultValues: {
      typeId: documentData.typeId,
      name: documentData.name,
    },
  })

  const handleSubmit = () => async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await mutateAsync(
        {
          IfMatch: documentData._eTag!,
          name: getValues('name')!,
          typeId: getValues('typeId')!,
        },
        {
          onSuccess: () => {
            closeModal()
          },
          onSettled: () => {
            queryClient.invalidateQueries(['tenancy-check-document', documentData.associatedId])
          },
        },
      )
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit()}>
        <FlexContainer isFlexAlignEnd>
          <Input type="text" {...register('name')} />
        </FlexContainer>
        <Select defaultValue="Letters" {...register('typeId')} className="el-mt4">
          {documentTypesData?.map((val) => (
            <option key={val.id} value={val.id}>
              {val.value}
            </option>
          ))}
        </Select>
        <ButtonGroup alignment="right" className="el-mt10">
          <Button type="submit" intent="primary" disabled={isLoading} loading={isLoading}>
            Save
          </Button>
          <Button type="button" disabled={isLoading} loading={isLoading} onClick={closeModal}>
            Cancel
          </Button>
        </ButtonGroup>
      </form>
    </>
  )
}

export default ModalEditDocument
